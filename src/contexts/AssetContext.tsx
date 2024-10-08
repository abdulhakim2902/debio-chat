import { createContext, FC, ReactNode, useContext, useEffect, useState } from 'react'
import { useNearWallet } from './NearContext'
import { AssetManager } from '@dfinity/assets'
import { HttpAgent } from '@dfinity/agent'
import { AppConfig } from '../config'
import { Ed25519KeyIdentity } from '@dfinity/identity'
import { enqueueSnackbar } from 'notistack'
import { v4 as uuidv4 } from 'uuid'

export type OnUploadData = {
  key?: string
  isLoading: boolean
  init: boolean
  file: File
  progress: number
  link?: string
}

export type AssetContextValue = {
  file?: File
  assets: Asset[]
  isUploading: boolean
  isUploaded: boolean

  addFile: (cb?: (data: OnUploadData) => void) => void
  uploadFile: (file: File, cb?: (data: OnUploadData) => void) => void
  removeFile: (key: string, cb?: () => void) => void
}

export const AssetContext = createContext<AssetContextValue>({
  assets: [],
  isUploaded: false,
  isUploading: false,

  addFile: () => {},
  uploadFile: () => {},
  removeFile: () => {}
})

type AssetProviderProps = {
  children: ReactNode
}

type Asset = {
  key: string
  filename: string
  size: number
}

const identity = Ed25519KeyIdentity.fromSecretKey(Buffer.from(AppConfig.STORAGE_SECRET_KEY))
const agent = HttpAgent.createSync({
  host: `https://${AppConfig.STORAGE_HOST}`,
  identity
})

const assetManager = new AssetManager({ canisterId: AppConfig.STORAGE_CANISTER_ID, agent })

export const AssetProvider: FC<AssetProviderProps> = ({ children }) => {
  const { signedAccountId } = useNearWallet()

  const [file, setFile] = useState<File>()
  const [assets, setAssets] = useState<Asset[]>([])
  const [isUploaded, setIsUploaded] = useState<boolean>(false)
  const [isUploading, setIsUploading] = useState<boolean>(false)

  useEffect(() => {
    if (assetManager && signedAccountId) {
      assetManager
        .list()
        .then(assets =>
          assets
            .filter(asset => asset.key.startsWith(`/uploads/${signedAccountId}`))
            .sort((a, b) => Number(b.encodings[0].modified - a.encodings[0].modified))
            .map(asset => {
              const { key, encodings } = asset

              const fileName = key.split('/').slice(-1)[0]

              return {
                key: key,
                filename: fileName,
                size: Number(encodings?.[0].length || 0)
              }
            })
        )
        .then(setAssets)
    }
    /* eslint-disable */
  }, [signedAccountId])

  const addFile = async (cb?: (data: OnUploadData) => void) => {
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

        const data = {
          isLoading: false,
          init: true,
          file: input.files[0],
          progress: 0
        } as OnUploadData

        cb && cb(data)
      }
    }
  }

  const uploadFile = async (file: File, cb?: (data: OnUploadData) => void) => {
    if (!assetManager) return
    if (isUploaded || isUploading) return

    const data = {
      isLoading: true,
      init: false,
      file: file,
      progress: 0
    } as OnUploadData

    try {
      setIsUploading(true)

      cb && cb(data)

      const batch = assetManager.batch()

      const key = await batch.store(file, {
        path: `/uploads/${signedAccountId}`,
        fileName: uuidv4().toString()
      })

      await batch.commit({
        onProgress: ({ current, total }) => {
          data.progress = (current / total) * 100

          cb && cb(data)
        }
      })

      setIsUploaded(true)

      setTimeout(() => setIsUploaded(false), 3000)

      data.isLoading = false
      data.key = key
      data.link = `https://${AppConfig.STORAGE_CANISTER_ID}.${AppConfig.STORAGE_HOST}${key}`

      cb && cb(data)
    } catch (err: any) {
      cb && cb({ ...data, isLoading: false })
      enqueueSnackbar(err.message, {
        variant: 'error'
      })
    } finally {
      setIsUploading(false)
      setFile(undefined)
    }
  }

  const removeFile = async (key: string, cb?: () => void) => {
    await assetManager.delete(key)

    cb && cb()
  }

  return (
    <AssetContext.Provider value={{ isUploading, addFile, uploadFile, file, isUploaded, assets, removeFile }}>
      {children}
    </AssetContext.Provider>
  )
}

export const useAsset = () => useContext(AssetContext)
