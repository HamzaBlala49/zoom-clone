"use client"

import { useGetCalls } from '@/hooks/useGetCalls'
import { Call, CallRecording } from '@stream-io/video-react-sdk'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import MeetingCard from '../MeetingCard'
import Loader from '../Loader'
import { useToast } from './use-toast'

type callListProps = {
    type: 'ended' | 'upcoming' | 'recording'
}

const CallList = ({type}:callListProps) => {
    const {endedCalls, upcomingCalls, callRecordings, isLoading} = useGetCalls()
    const router = useRouter()
    const [recording, setRecording] = useState<CallRecording[]>([])
    const {toast} = useToast()

    const getCalls = () =>{
        switch (type) {
            case "ended":
                return endedCalls
        
            case "recording":
                return recording

            case 'upcoming':
                return upcomingCalls

            default:
                return []
        }
    }

    const getNoCallsMessage = () =>{
        switch (type) {
            case "ended":
                return 'No Previous Calls'
        
            case "recording":
                return 'No Recordings Calls'

            case 'upcoming':
                return 'No Upcoming Calls'

            default:
                return ''
        }
    }

    useEffect(() => {
        
            const fetchRecording = async () => {
                try {
                const callData = await Promise.all(callRecordings.map((meeting) => meeting.queryRecordings()))
    
                const recordings = callData
                .filter(call => call.recordings.length > 0)
                .flatMap(call => call.recordings)
    
                setRecording(recordings)
            } catch (error) {
                    console.log(error)
                    toast({
                        title:"Try again later"
                    })
                }

            }
    
            if(type === "recording") fetchRecording()
       
    }, [type,callRecordings])
    
    
    const calls = getCalls()
    const noCallsMessage = getNoCallsMessage()

    if(isLoading) return <Loader/>

    return (
        <div className='grid grid-cols-1 gap-5 xl:grid-cols-2'>
            {calls && calls.length > 0 ? calls.map ((meeting:Call | CallRecording)=>(
                <MeetingCard
                    key={(meeting as Call).id}
                    icon={ type === "ended" ? '/icons/previous.svg' : type === "upcoming" ? '/icons/upcoming.svg' : '/icons/recordings.svg' }
                    title={(meeting as Call ).state?.custom.description || (meeting as CallRecording ).filename.substring(0,30) || "No description"}
                    date={ (meeting as Call ).state?.startsAt?.toLocaleString() || (meeting as CallRecording ).start_time.toLocaleString() }
                    isPreviousMeeting ={ type === "ended"}
                    buttonIcon1={ type === "recording" ? "/icons/play.svg" : undefined}
                    buttonText={ type === "recording" ? "Play" : "Start" }
                    link={type === "recording" ? (meeting as CallRecording ).url : `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${(meeting as Call ).id}`}
                    handleClick={ type === "recording" ? ()=> router.push((meeting as CallRecording ).url): ()=> router.push(`/meeting/${(meeting as Call).id}`)  }
                />
            )) : (
                <h1>{noCallsMessage}</h1>
            )}
        </div>
    )
}

export default CallList