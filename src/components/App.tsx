import {useState, useEffect, useRef, type KeyboardEvent} from 'react'
import {XCircleIcon, PrinterIcon} from '@heroicons/react/20/solid'
import throttle from 'lodash-es/throttle'

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const [labels, setLabels] = useState([''])

  const [isOverflow, setIsOverflow] = useState(false)
  const labelWidthInInches = 4
  const labelHeightInInches = 6
  const inchToPixel = 96 // 1 inch is approximately 96 pixels
  const printingDPI = 300

  const cableTagTextPadding = 18
  const cableTagTextLineSpacing = 8
  const cableTagCutLineThickness = 2

  const printSingleCableTag = (
    text: string,
    yOffset: number,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const fontSize = 14 // You can adjust the size of the font
    ctx.font = `${fontSize}px monospace` // Set the font style
    ctx.fillStyle = 'black' // Set the text color

    // Set the origin to the top-middle of the canvas, and rotate the context by 90 degrees
    ctx.save()

    ctx.translate(width, 0) // Move to the right so you start drawing the text at bottom (because it's rotated)
    ctx.rotate((90 * Math.PI) / 180)

    // Calculate the space needed for one line of text (height-wise after rotation)
    const textMetrics = ctx.measureText(text.toUpperCase())
    const singleTextHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent
    const textWidth = Math.ceil(textMetrics.width)

    // Calculate the total space available (width-wise, since the text is rotated)
    const totalSpaceAvailable = canvas.height - 2 * cableTagTextPadding

    // Calculate the number of times the text can be repeated
    const repetitions = Math.floor(
      (totalSpaceAvailable + cableTagTextLineSpacing) / (singleTextHeight + cableTagTextLineSpacing)
    )

    // Loop and draw the text
    for (let i = 0; i < repetitions; i++) {
      const yPos = cableTagTextPadding + i * (singleTextHeight + cableTagTextLineSpacing)
      ctx.fillText(text.toUpperCase(), cableTagTextPadding + yOffset, yPos) // Adjust x, y position as needed
    }

    ctx.restore()
    const cutLineYStart = textWidth + cableTagTextPadding * 2

    console.log(cutLineYStart + cableTagCutLineThickness + yOffset > height, cutLineYStart + yOffset, height)
    if (cutLineYStart + cableTagCutLineThickness + yOffset > height) {
      setIsOverflow(true)
    }

    if (text) {
      ctx.fillRect(0, cutLineYStart + yOffset, width, cableTagCutLineThickness)
    }
    return cutLineYStart + cableTagCutLineThickness
  }

  const updateCanvas = throttle(
    () => {
      if (canvasRef.current) {
        setIsOverflow(false)
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        canvas.width = labelWidthInInches * printingDPI
        canvas.height = labelHeightInInches * printingDPI

        if (ctx) {
          // Scale context to dpi
          const scaleWidth = printingDPI / inchToPixel
          const scaleHeight = printingDPI / inchToPixel
          ctx.scale(scaleWidth, scaleHeight) // Assuming screen DPI is 96

          const canvasWidth = canvas.width / scaleWidth
          const canvasHeight = canvas.height / scaleHeight

          ctx.fillStyle = 'white'
          ctx.fillRect(0, 0, canvasWidth, canvasHeight)

          ctx.lineWidth = 1 // Adjust line width for the device pixel ratio
          ctx.strokeStyle = '#bbb' // Border color
          ctx.strokeRect(0, 0, canvasWidth, canvasHeight) // Draw border

          let startY = 0
          for (let i = 0; i < labels.length; i++) {
            const newY = printSingleCableTag(labels[i], startY, canvas, ctx, canvasWidth, canvasHeight)
            startY += newY
          }

          console.log('done rendering')
        }
      }
    },
    250,
    {
      leading: true,
      trailing: true
    }
  )

  useEffect(() => {
    // Adjust the refs array length to match the number of labels
    inputRefs.current = inputRefs.current.slice(0, labels.length)

    updateCanvas()
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
          <div className='mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-2 print:block'>
            {/* Label Creation */}
            <div className='lg:col-start-2 lg:row-end-1 print:hidden'>
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
                        <div
                          className='flex flex-1 items-center space-x-4'
                          key={`input-${index}`}
                        >
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

            <div className='mx-auto flex w-full justify-center'>
              <canvas
                id='printer-canvas'
                ref={canvasRef}
                className='w-full md:h-[6in] md:w-[4in] print:max-h-[6in] print:max-w-[4in]'
              ></canvas>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
