import { SignalHigh, SignalMedium, SignalLow } from 'lucide-react'

export default function PriorityBadge({ priority }: { priority: string }) {
    if (priority === 'high') {
        return (
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-rose-600">
                <SignalHigh className="h-3 w-3" />
            </div>
        )
    }
    if (priority === 'medium') {
        return (
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-orange-500">
                <SignalMedium className="h-3 w-3" />
            </div>
        )
    }
    // Low is usually invisible or very subtle to reduce noise
    return null
}