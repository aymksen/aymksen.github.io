import "./skills.scss";
import React from "react";
// import Slider from "infinite-react-carousel";
import Aos from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from "react";

export default function Works() {
  useEffect(() =>{
   
    Aos.init({duration:2000});
  },[]);

  // let settings = {
  //   arrows: false,
  //   arrowsBlock: false,
  //   autoplay: true,
  //   autoplayScroll: 3,
  //   autoplaySpeed: 2500,
  //   centerPadding: 0,
  //   duration: 300,
  //   pauseOnHover: false,
  //   rows: 2,
  //   gutter: 50,
  //   swipe: false
  // };

  

  // const [dimensions, setDimensions] = React.useState({ 
  //   height: window.innerHeight,
  //   width: window.innerWidth
  // })
//   React.useEffect(() => {
//     function handleResize() {
//       setDimensions({
//         height: window.innerHeight,
//         width: window.innerWidth
//       })
// }

//     window.addEventListener('resize', handleResize)
//   })

//   if (dimensions.width > 850) {
//     settings.slidesToShow = 5;
//   } else if (dimensions.width < 850) {
//     settings.slidesToShow = 3;
//     settings.rows = 3;
//   }
  return (
    <div className="works" id="Skills">
      <div data-aos="fade-up"  className="txt">Skills</div>

      <div  data-aos="fade-up" data-aos-delay="200" className="sliderc">
        <div className="slider">
          <div className="ic">
            <img src={require("./html.png")} alt=""/>
            <div className="desc">HTML</div>
          </div>
          <div className="ic">
            <img src={require("./css.png")} alt=""/>
            <div className="desc">CSS</div>
          </div>
          <div className="ic">
            <img src={require("./js.png")} alt=""/>
            <div className="desc">JavaScript</div>
          </div>
          <div className="ic">
            <img src={require("./git.png")} alt=""/>
            <div className="desc">GIT</div>
          </div>
          <div className="ic">
            <img src={require("./jquery.png")} alt=""/>
            <div className="desc">jQuery</div>
          </div>
          <div className="ic">
            <img src={require("./react.png")} alt=""/>
            <div className="desc">React</div>
          </div>
          <div className="ic">
            <img src={require("./sass.png")} alt=""/>
            <div className="desc">Sass</div>
          </div>
          <div className="ic">
            <img src={require("./tw.png")} alt=""/>
            <div className="desc">Tailwind</div>
          </div>
          <div className="ic">
            <img src={require("./php.png")} alt=""/>
            <div className="desc">PHP</div>
          </div>
          <div className="ic">
            <img src={require("./unity.png")} alt=""/>
            <div className="desc">Unity</div>
          </div>
          <div className="ic">
            <img src={require("./c++.png")} alt=""/>
            <div className="desc">C++</div>
          </div>
          <div className="ic">
            <img src={require("./csh.png")} alt=""/>
            <div className="desc">C#</div>
          </div>
          <div className="ic">
            <img src={require("./python.png")} alt=""/>
            <div className="desc">Python</div>
          </div>
          <div className="ic">
            <img src={require("./ps.png")} alt=""/>
            <div className="desc">Photoshop</div>
          </div>
          <div className="ic">
            <img src={require("./ai.png")} alt=""/>
            <div className="desc">Illustrator</div>
          </div>
          <div className="ic">
            <img src={require("./lr.png")} alt=""/>
            <div className="desc">Lightroom</div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
