import axios from 'axios';
import { useEffect, useState } from 'react'

export default function Animation() {
  
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    getTime();
  }, []);
  
  async function getTime() {
    let response = await axios.get("/api/time");
    setCurrentTime(response.data.time);
  };

  return (
    <p>The current time is {currentTime}.</p>
  )
  
  
  // const [fade, setFade] = useState(false)
  
  // const triggerFade = () => {
  //   setFade(prevState => {
  //     return !prevState
  //   })
  // }
  
  // return (
  //   <>
  //       <div onAnimationEnd={triggerFade} className={fade ? 'slideIn' : 'visibleClass'}>
  //           Watch me fade
  //       </div>
  //       <button onClick={triggerFade}>Click Me</button>
  //   </>
  // )
}