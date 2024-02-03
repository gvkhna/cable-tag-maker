import {useState, useEffect, useRef, type KeyboardEvent} from 'react'
import {XCircleIcon, PrinterIcon} from '@heroicons/react/20/solid'

export default function Page() {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const labelRefs = useRef<(HTMLDivElement | null)[]>([])
  // const [labels, setLabels] = useState(['Testing Cable', 'Testing Cable 2', 'Testing Cable 3'])

  const [labels, setLabels] = useState([''])

  const [isOverflow, setIsOverflow] = useState(false)
  const maxHeightInInches = 6
  const inchToPixel = 96 // 1 inch is approximately 96 pixels

  useEffect(() => {
    // Adjust the refs array length to match the number of labels
    inputRefs.current = inputRefs.current.slice(0, labels.length)

    // Calculate total height of label lines
    const totalHeight = labelRefs.current.reduce((acc, ref) => {
      return acc + (ref ? ref.getBoundingClientRect().height : 0)
    }, 0)

    // Convert max height in inches to pixels and compare
    if (totalHeight > maxHeightInInches * inchToPixel) {
      setIsOverflow(true)
    } else {
      setIsOverflow(false)
    }
  }, [labels])

  const focusNextInput = (index: number) => {
    const nextIndex = index + 1
    if (nextIndex < inputRefs.current.length) {
      inputRefs.current[nextIndex]?.focus()
    }
  }

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.keyCode === 13) {
      // 13 is the Enter key
      event.preventDefault() // Prevent the default Enter key action
      focusNextInput(index)
    }
  }

  useEffect(() => {
    // If the last label is not empty, add a new empty label
    if (labels.length === 0 || labels[labels.length - 1].trim() !== '') {
      setLabels([...labels, ''])
    }
  }, [labels])

  const handleInputChange = (index: number, newValue: string) => {
    setLabels((prevLabels) => {
      const newLabels = [...prevLabels]
      newLabels[index] = newValue

      // If the modified input is the last one and it's not empty, add a new empty input.
      if (index === prevLabels.length - 1 && newValue.trim() !== '') {
        newLabels.push('')
      }

      return newLabels
    })
  }

  const handleDelete = (index: number) => {
    setLabels((prevLabels) => {
      if (prevLabels.length === 1) {
        // If there's only one input, clear it instead of deleting.
        return ['']
      } else {
        // Remove the label at the specified index
        return prevLabels.filter((_, i) => i !== index)
      }
    })
  }

  return (
    <>
      <header className='border-b border-gray-900/10 print:hidden'>
        <div className='mx-auto py-1 text-center'>
          <h1 className='items-center gap-x-6 font-medium'>Print &rsquo;Cable Tags&rsquo; on 4x6 Shipping Labels</h1>
          <h2 className='text-xs italic'>(Just cut along the lines)</h2>
        </div>
      </header>
      <main>
        <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 print:max-w-none print:px-0 print:py-0'>
          <div className='mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3 print:block'>
            {/* Label Creation */}
            <div className='lg:col-start-3 lg:row-end-1 print:hidden'>
              <h2 className='sr-only'>Summary</h2>
              <div
                className={`rounded-lg ${isOverflow ? 'bg-red-300' : 'bg-gray-50'} shadow-sm ring-1 ring-gray-900/5`}
              >
                <dl className='flex flex-wrap'>
                  <div className='flex-auto pl-6 pt-4'>
                    <dt className='text-base font-semibold leading-6 text-gray-900'>Labels</dt>
                  </div>

                  <div className='mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-4'>
                    <div className='flex flex-1 flex-col space-y-3'>
                      {labels.map((label, index) => (
                        <div className='flex flex-1 items-center space-x-4'>
                          <input
                            type='text'
                            value={label}
                            ref={(el) => (inputRefs.current[index] = el)}
                            onChange={(e) => handleInputChange(index, e.currentTarget.value)}
                            className='flex-1 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                            placeholder='Living Room'
                            onKeyDown={(e) => handleKeyDown(index, e)}
                          />
                          <button
                            type='button'
                            className=' appearance-none'
                            tabIndex={-1}
                            onClick={() => handleDelete(index)}
                          >
                            <XCircleIcon className='h-6 w-6 fill-current text-red-500' />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </dl>
                <div className='mt-6 border-t border-gray-900/5 px-6 py-4'>
                  <button
                    tabIndex={-1}
                    type='button'
                    onClick={() => {
                      window.print()
                    }}
                    className=' flex appearance-none items-center space-x-3 text-base font-semibold leading-6 text-gray-900'
                  >
                    <PrinterIcon
                      className='h-6 w-5 text-gray-400'
                      aria-hidden='true'
                    />{' '}
                    <span>Print</span>
                  </button>
                </div>
                {/* <div className='border-t border-gray-900/5 px-6 py-4'>
                  <a
                    href='#'
                    className='text-base font-semibold leading-6 text-gray-900'
                  >
                    Download PDF <span aria-hidden='true'>&rarr;</span>
                  </a>
                </div> */}
              </div>
            </div>

            {/* Printer Label Preview */}
            <div className='mx-auto w-full overflow-hidden ring-1 ring-gray-900/5 sm:rounded-lg md:h-[6in] md:w-[4in] lg:col-span-2 lg:row-span-2 lg:row-end-2 print:max-h-[6in] print:max-w-[4in] '>
              <div className='mx-auto overflow-hidden px-2'>
                {/* <div className='-mx-4 px-4 py-8  sm:mx-0  sm:px-8 sm:pb-14  xl:px-16 xl:pb-20 xl:pt-16'> */}
                {labels.map((label, index) => (
                  <div
                    key={index}
                    ref={(el) => (labelRefs.current[index] = el)}
                    className='max-w-[3.75in] overflow-hidden border-b-2 border-black py-6'
                    style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed'
                    }}
                  >
                    {[...Array(40)].map((n, i) => (
                      <p className='font-mono text-sm font-semibold uppercase leading-4 tracking-wide'>{label}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
