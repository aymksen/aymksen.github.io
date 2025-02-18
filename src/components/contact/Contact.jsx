import "./contact.scss";
import { useState, useRef, useEffect } from "react";
import emailjs from "@emailjs/browser";
import Aos from 'aos';
import 'aos/dist/aos.css';

const Result = () => {
  return <button class="sumbit  row" value="Send">
  SENT!
</button>;
};


const Button = () => {
  return  <button class="sumbit" value="Send">
              SUBMIT
            </button>;
};

export default function Contact() {
  useEffect(() =>{
   
    Aos.init({duration:2000});
  },[]);
  const form = useRef();
  const [result, showResult] = useState(false);
  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_yt8ebgx",
        "template_ptp1jhe",
        form.current,
        "YCKqvOTkXtrbF6pXx"
      )
      .then(
        (result) => {
          console.log(result.text);
          console.log("meesage sent");
        },
        (error) => {
          console.log(error.text);
        }
      );
    e.target.reset();
    showResult(true);
  };

  return (
    <div className="contact" id="contact" >
       
      <p data-aos="fade-up" data-aos-delay="100" className="text">Contact</p>
     
      <div className="Eform" data-aos="fade-up" data-aos-delay="150">
        
        <form ref={form} onSubmit={sendEmail}>
          <div class="formWord" >
            <input className="Eform" data-aos="fade-up" data-aos-delay="200"
              class="input100 age"
              placeholder="name"
              type="text"
              name="fullName"
              required
            />

            <input className="Eform" data-aos="fade-up" data-aos-delay="300"
              class="input100"
              type="tel"
              placeholder="Phone Number (optional)"
              name="phone"
            />

            <input className="Eform" data-aos="fade-up" data-aos-delay="400"
              class="input100"
              placeholder="Email Address"
              type="email"
              name="email"
              required
            />
          </div>
          <div class="formWord">
            <textarea className="Eform" data-aos="fade-up" data-aos-delay="500"
              class="input100 message"
              name="message"
              placeholder="message...."
              required
            ></textarea>

            
            <div >{result ? <Result /> : <Button/>}</div>
            
          </div>
         
        </form>
        
      </div>
      
    </div>
    
  );
}
