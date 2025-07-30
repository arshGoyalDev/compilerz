const LoadingScreen = () => {
  return (
    <div className="z-50 absolute top-0 left-0 w-full h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center gap-8 justify-center">
      <div className="relative w-16 h-16">
        <div className="animate-loading absolute left-0 bottom-0 w-7 h-7 bg-neutral-800 dark:bg-neutral-200 rounded-sm"></div>
      </div>
      <div className="flex gap-3 items-end text-xl lg:scale-125 text-neutral-500">Setting up your <span className="text-3xl text-black dark:text-white">Compiler</span></div>
    </div>
  )
}

export default LoadingScreen;