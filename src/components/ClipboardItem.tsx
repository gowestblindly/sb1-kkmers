import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'

interface ClipboardItemProps {
  item: {
    text: string
    source: string
    summary: string
    inspiration: string
  }
}

const ClipboardItem: React.FC<ClipboardItemProps> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-white rounded-md shadow-md p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-500">{item.source}</span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-500"
        >
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </button>
      </div>
      <p className="text-gray-800 mb-2">{item.text.substring(0, 100)}...</p>
      {isExpanded && (
        <>
          <h3 className="font-semibold mt-2">Summary:</h3>
          <p className="text-gray-700">{item.summary}</p>
          <h3 className="font-semibold mt-2 flex items-center">
            <Lightbulb className="mr-1" /> Inspiration:
          </h3>
          <p className="text-gray-700">{item.inspiration}</p>
        </>
      )}
    </div>
  )
}

export default ClipboardItem