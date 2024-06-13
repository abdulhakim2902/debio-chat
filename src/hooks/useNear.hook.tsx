import { useContext } from 'react'
import { NearContext, NearContextValue } from '../contexts/NearContext'

export const useNear = (): NearContextValue => useContext(NearContext)
