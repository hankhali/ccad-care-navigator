import { useEffect, useState } from 'react'

export default function ERWait() {
  const [wait, setWait] = useState(12) // minutes
  useEffect(() => {
    // simulate changes
    const id = setInterval(() => {
      setWait((w) => Math.max(2, w + (Math.random() > 0.6 ? -1 : 1)))
    }, 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="p-4 bg-card rounded border">
      <h4 className="font-medium">ER Wait Time</h4>
      <div className="mt-2 text-2xl font-semibold">{wait} min</div>
      <div className="text-sm text-muted-foreground mt-1">Estimated time to be seen in Emergency Department</div>
    </div>
  )
}
