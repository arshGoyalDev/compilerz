const Output = () => {
  return (
    <div className='h-full grid grid-rows-[auto_1fr] bg-neutral-100 dark:bg-neutral-900 border-t-2 border-neutral-200 dark:border-neutral-800'>
      <div className='flex items-center h-12 border-b-2 justify-between border-neutral-200 dark:border-neutral-800'>
        <div className='px-5'>Output</div>
          <button className='cursor-pointer bg-neutral-950 dark:bg-white py-1 h-fit px-4 text-white dark:text-black mr-2'>Clear</button>
      </div>
      <div className='bg-neutral-50 dark:bg-neutral-950 h-full'></div>
    </div>
  )
}

export default Output