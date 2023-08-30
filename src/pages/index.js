import { Fragment, useRef, useState } from 'react';

import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

const users = [
  { name: 'Max' },
  { name: 'Alex' },
]

import cv from '@/cv';
import { createParser } from 'eventsource-parser';
import nl2br from 'nl2br';

export default function Home() {
  const [selected, setSelected] = useState(users[0]);
  const job_description = useRef(null)
  const [loading, setLoading] = useState(false)
  const [coverletter, setCoverletter] = useState("")

  const onGenerate = async () => {
    //   setLoading(true)
    const resume = cv[selected.name.toLowerCase()]
    const message = resume + "\n\n" + job_description?.current?.value;
    // const response = await fetch('/api/chat-gpt', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     message
    //   }),
    // });
    // const result = await response.json();
    // setCoverletter(result.answer)


    const response = await fetch('/api/chat-stream', {
      method: 'POST',
      body: JSON.stringify({
        message
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    function onParse(event) {
      if (event.type === 'event') {
        try {
          const data = JSON.parse(event.data);
          data.choices
            .filter(({ delta }) => !!delta.content)
            .forEach(({ delta }) => {
              setCoverletter(prev => {
                return `${prev || ''}${delta.content}`;
              })
            });
        } catch (e) {
          console.log(e)
        }
      }
    }

    const parser = createParser(onParse)

    while (true) {
      const { value, done } = await reader.read();
      const dataString = decoder.decode(value);
      if (done || dataString.includes('[DONE]')) break;
      parser.feed(dataString);
    }

    //  setLoading(false)
  }

  return (
    <main
      className={``}
    >
      {/* <LoadingOverlay
        active={loading}
        spinner={<RingLoader color={"#36d7b7"} />}
      > */}
      <div className='flex min-h-screen flex-col items-center p-6 gap-y-4'>
        <h1 className='text-6xl'>Cover letter Generator</h1>
        <div className='flex items-center'>
          <Listbox value={selected} onChange={setSelected}>
            <div className="relative mt-1">
              <Listbox.Button className="relative cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm w-40">
                <span className="block truncate">{selected.name}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {users.map((user, personIdx) => (
                    <Listbox.Option
                      key={personIdx}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                        }`
                      }
                      value={user}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                              }`}
                          >
                            {user.name}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>

        </div>
        <div className='flex flex-row w-full gap-x-8'>
          <div className='flex flex-col w-full gap-y-4'>

            <label htmlFor="message" className="block text-2xl font-medium text-gray-900 dark:text-white">Job Description</label>
            <textarea ref={job_description} id="message" rows={20} className="h-full block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Write your thoughts here..."></textarea>
            <button onClick={onGenerate} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Generate</button>
          </div>
          <div className='flex flex-col w-full gap-y-4'>

            <label htmlFor="message" className="block text-2xl font-medium text-gray-900 dark:text-white">Cover letter{loading && " Generating now...."}</label>
            <div dangerouslySetInnerHTML={{ __html: nl2br(coverletter) }} className="h-full block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"></div>
          </div>
        </div>
      </div>
      {/* </LoadingOverlay> */}

    </main>
  )
}
