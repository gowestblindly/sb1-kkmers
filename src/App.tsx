import React, { useState, useEffect } from 'react'
import { Clipboard, Save, Lightbulb } from 'lucide-react'
import ClipboardItem from './components/ClipboardItem'
import { analyzeText } from './utils/textAnalysis'

interface ClipboardData {
  id: string
  text: string
  source: string
  summary: string
  inspiration: string
}

function App() {
  const [clipboardItems, setClipboardItems] = useState<ClipboardData[]>([])
  const [isExtension, setIsExtension] = useState(false)

  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        // @ts-ignore
        await chrome.storage.local.get(['clipboardItems'])
        setIsExtension(true)
      } catch (error) {
        setIsExtension(false)
      }
    }

    checkEnvironment()
  }, [])

  useEffect(() => {
    if (isExtension) {
      // @ts-ignore
      chrome.storage.local.get(['clipboardItems'], (result) => {
        if (result.clipboardItems) {
          setClipboardItems(result.clipboardItems)
        }
      })
    } else {
      const storedItems = localStorage.getItem('clipboardItems')
      if (storedItems) {
        setClipboardItems(JSON.parse(storedItems))
      }
    }
  }, [isExtension])

  const captureClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const analysis = await analyzeText(text)
      const newItem: ClipboardData = {
        id: Date.now().toString(),
        text,
        source: 'Clipboard',
        summary: analysis.summary,
        inspiration: analysis.inspiration,
      }
      const updatedItems = [newItem, ...clipboardItems]
      setClipboardItems(updatedItems)
      
      if (isExtension) {
        // @ts-ignore
        chrome.storage.local.set({ clipboardItems: updatedItems })
      } else {
        localStorage.setItem('clipboardItems', JSON.stringify(updatedItems))
      }
    } catch (error) {
      console.error('Failed to read clipboard:', error)
    }
  }

  return (
    <div className="w-96 min-h-[400px] bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4 flex items-center">
        <Clipboard className="mr-2" /> Clipboard Analyzer
      </h1>
      <button
        onClick={captureClipboard}
        className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4 flex items-center"
      >
        <Save className="mr-2" /> Capture Clipboard
      </button>
      <div className="space-y-4">
        {clipboardItems.map((item) => (
          <ClipboardItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

export default App