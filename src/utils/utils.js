import { exec } from 'child_process'
import fs from 'fs'
import speech from '@google-cloud/speech'
import process from 'process'

export async function transcribe_audio(filename, language) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = 'C:/Users/micha/Downloads/cred.json';
  const client = new speech.SpeechClient();

  const file = fs.readFileSync(filename);
  const audioBytes = file.toString('base64');

  const audio = {
    content: audioBytes,
  };

  const config = {
    encoding: 'MP3',
    sampleRateHertz: 44100,
    languageCode: language,
  };
  const request = {
    audio: audio,
    config: config,
  };

  const [response] = await client.recognize(request);
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  return transcription;
}

export async function decode_silk(silk_path) {
    await run_cmd(`sh C:/Users/micha/Downloads/silk/silk-v3-decoder/converter.sh ${silk_path} mp3`)
}

export async function run_cmd(cmd) {
    await new Promise((resolve, reject) => {
        exec(`cmd.exe /c ${cmd}`, (error, stdout, stderr) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
}