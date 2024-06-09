import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Button } from '@/components/ui/button.tsx';
import { MicIcon } from 'lucide-react';
import { useAudioRecorder } from 'react-audio-voice-recorder';

async function ask(url: string, audio: Blob, messages: { role: 'user' | 'assistant', content: string }[]) {
  const formData = new FormData();
  formData.append('audio', audio, 'audio.wav');
  messages.forEach((message, index) => {
    formData.append(`messages[${index}]`, JSON.stringify(message));
  })
  const r = await fetch(`${url}`, {
    method: 'POST',
    body: formData
  })
  return await r.json()
}


function App() {

  const [history, setHistory] = useState<{
    role: 'user' | 'assistant',
    content: string,
  }[]>([])

  const [url, setUrl] = useState<string>("")

  const [textResponse, setTextResponse] = useState<string>("")

  const recorderControls = useAudioRecorder()

  useEffect(() => {
    const blob = recorderControls.recordingBlob;
    if (blob) {
      ask(url, blob, history).then((response) => {
        const text = response.text;
        const audioBase64 = response.audio;
        const input = response.input;
        setTextResponse(text);
        setHistory(h => [...h, {
          role: 'user',
          content: input
        }, {
          role: 'assistant',
          content: text
        }])
        const audio = new Audio(`${audioBase64}`);
        audio.play();
      })
    }

  }, [recorderControls.recordingBlob])
  return (
    <>
      <div className="max-w-4xl mx-auto p-4 md:p-8 !pb-0 gap-4 flex flex-col">
        <h1 className="text-4xl font-bold text-center">AIFriend</h1>
        <Input placeholder={'http://ngrok.com/abc'} onChange={(e) => {
          setUrl(e.target.value)
        }}/>
      </div>
      <div className="flex flex-col items-center justify-center gap-6 my-6">
        <div className="flex flex-col items-center gap-4">
          <Textarea
            placeholder="La respuesta aparecerá acá..."
            className="w-[600px] max-w-md p-4 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
            rows={5}
            value={textResponse}
          />
          {
            recorderControls.isRecording ? (
              <Button
                onClick={() => recorderControls.stopRecording()}
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <MicIcon className="w-5 h-5 text-red-600"/>
                Detener grabación
              </Button>
            ) : (
              <Button
                onClick={() => recorderControls.startRecording()}
                className="flex items-center gap-2 px-4 py-2 rounded-md"
              >
                <MicIcon className="w-5 h-5"/>
                Empezar a grabar
              </Button>
            )
          }

        </div>
        {
          !recorderControls.isRecording ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Click en "Empezar a grabar" para empezar.</p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Grabando...</p>
          )
        }
      </div>
    </>
  )
}

export default App
