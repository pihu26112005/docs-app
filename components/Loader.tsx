import Image from 'next/image'
import React from 'react'

const Loader = () => {
  return (
    <div className='loader'>
        <Image 
            src='/assets/icons/loader.svg'
            alt='Loader'
            width={100}
            height={100}
            className='animate-spin'
        />
    </div>
  )
}

export default Loader