import { createContext, FC, ReactNode, useContext, useEffect, useState } from 'react'
import { useNearWallet } from './NearContext'
import { AssetManager } from '@dfinity/assets'
import { HttpAgent } from '@dfinity/agent'
import { AppConfig } from '../config'
import { Ed25519KeyIdentity } from '@dfinity/identity'
import { enqueueSnackbar } from 'notistack'
import { v4 as uuidv4 } from 'uuid'

export type AssetContextValue = {
  file?: File
  progress: number
  isUploading: boolean
  isUploaded: boolean

  addFile: () => void
  uploadFile: (file: File, cb?: (link: string) => void) => void
}

export const AssetContext = createContext<AssetContextValue>({
  progress: 0,
  isUploaded: false,
  isUploading: false,
  addFile: () => {},
  uploadFile: () => {}
})

type AssetProviderProps = {
  children: ReactNode
}

const identity = Ed25519KeyIdentity.fromSecretKey(Buffer.from(AppConfig.STORAGE_SECRET_KEY))

export const AssetProvider: FC<AssetProviderProps> = ({ children }) => {
  const [file, setFile] = useState<File>()
  const [progress, setProgress] = useState<number>(0)
  const [isUploaded, setIsUploaded] = useState<boolean>(false)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [assetManager, setAssetManager] = useState<AssetManager>()

  const { signedAccountId } = useNearWallet()

  useEffect(() => {
    if (signedAccountId) {
      const agent = HttpAgent.createSync({
        host: `https://${AppConfig.STORAGE_HOST}`,
        identity
      })

      const assetManager = new AssetManager({ canisterId: AppConfig.STORAGE_CANISTER_ID, agent })

      setAssetManager(assetManager)
    }
  }, [signedAccountId])

  const addFile = async () => {
    if (isUploaded || isUploading) return

    const input = document.createElement('input')

    input.type = 'file'
    input.multiple = false
    input.click()
    input.onchange = async () => {
      if (input.files && input.files.length > 0) {
        const file = input.files[0]
        if (file.size > Math.pow(10, 9)) {
          return enqueueSnackbar('Max size of 1 GB', {
            variant: 'error'
          })
        }

        if (file.type !== 'application/x-gzip' && file.type !== 'text/x-vcard') {
          return enqueueSnackbar('Only allowed .gz or .vcf', {
            variant: 'error'
          })
        }

        setFile(input.files[0])
      }
    }
  }

  const uploadFile = async (file: File, cb?: (link: string) => void) => {
    if (!assetManager) return
    if (isUploaded || isUploading) return

    try {
      setProgress(0)
      setIsUploading(true)

      const batch = assetManager.batch()

      const key = await batch.store(file, {
        path: `/uploads`,
        fileName: uuidv4().toString()
      })

      await batch.commit({
        onProgress: ({ current, total }) => setProgress((current / total) * 100)
      })

      setIsUploaded(true)

      setTimeout(() => setIsUploaded(false), 3000)

      cb && cb(`https://${AppConfig.STORAGE_CANISTER_ID}.${AppConfig.STORAGE_HOST}${key}`)
    } catch (err: any) {
      enqueueSnackbar(err.message, {
        variant: 'error'
      })
    } finally {
      setIsUploading(false)
      setFile(undefined)
    }
  }

  return (
    <AssetContext.Provider value={{ isUploading, progress, addFile, uploadFile, file, isUploaded }}>
      {children}
    </AssetContext.Provider>
  )
}

export const useAsset = () => useContext(AssetContext)
