import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { saveAppointment, getAppointments, verifyInsurance, sendSmsFallback, getUaeUser, notifyCaregiversForEvent } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

interface BookingModalProps {
  onClose?: () => void
  onBooked?: (appointment: any) => void
}

export default function BookingModal({ onClose, onBooked }: BookingModalProps) {
  const [name, setName] = useState('Demo User')
  const [specialty, setSpecialty] = useState('General Practice')
  const [genderPref, setGenderPref] = useState<'any'|'male'|'female'>('any')
  const [time, setTime] = useState('2025-10-15T10:00')
  const [uaeId, setUaeId] = useState('')
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)

  // listen for online/offline
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => setIsOnline(true))
    window.addEventListener('offline', () => setIsOnline(false))
  }

  function handleBook() {
    // if uae id present, attempt insurance verification (mock)
    if (uaeId) {
      const res = verifyInsurance(uaeId)
      if (res.status === 'unverified') {
        alert('Warning: Insurance could not be pre-verified (' + res.provider + ') — booking will be pending.');
      }
    }

    const appt = {
      id: String(Date.now()),
      specialty,
      time,
      location: 'Demo Clinic',
      status: isOnline ? 'confirmed' as const : 'pending' as const,
      queuePosition: Math.floor(Math.random() * 10) + 1,
      genderPreference: genderPref,
    }
    saveAppointment(appt)
    // if offline, create SMS fallback record
    if (!isOnline) {
      sendSmsFallback('+97100000000', `Please confirm your appointment for ${specialty} at ${new Date(time).toLocaleString()}`)
      toast({ title: 'Offline: SMS queued', description: 'An SMS fallback entry was queued and the appointment is pending.' })
    }
    try { window.dispatchEvent(new CustomEvent('appointment:created', { detail: appt })) } catch {}
    if (onBooked) onBooked(appt)
    if (onClose) onClose()
    try { notifyCaregiversForEvent('appointment', appt) } catch {}
    toast({ title: 'Appointment booked', description: `${specialty} at ${new Date(time).toLocaleString()}` })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-card p-6 rounded shadow-lg z-10 w-[480px]">
        <h3 className="text-lg font-semibold">Book Demo Appointment</h3>
        <div className="mt-4">
          <label className="text-sm">Name</label>
          <input className="w-full mt-2 p-2 border rounded" value={name} onChange={(e) => setName(e.target.value)} />
          <label className="text-sm mt-3 block">Specialty</label>
          <select className="w-full mt-2 p-2 border rounded" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
            <option>General Practice</option>
            <option>Emergency</option>
            <option>Pediatrics</option>
            <option>Cardiology</option>
          </select>
          <label className="text-sm mt-3 block">When</label>
          <input type="datetime-local" className="w-full mt-2 p-2 border rounded" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleBook}>Confirm Booking</Button>
        </div>
      </div>
    </div>
  )
}
