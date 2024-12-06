import { Box, Button, CircularProgress, Icon, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { SSE } from "sse.js";
import http from 'http';
import { env } from "next-runtime-env";
import ReactMarkdown from "react-markdown"; 
import {BouncingDotsLoader} from "../../components/threeBubbleAnimation"
import { customColors } from "@/layouts/customColors";
 
 
 
const ChatWithPDF = () => {
  const [step, setStep] = useState<"upload" | "processing" | "complete">("upload");
  const [fileName, setFileName] = useState<string>("");
  const [fileObject,setFileObject]=useState<File>();
  const [userchat, setUserchat] = useState<string>("");
  const [messages, setMessages] = useState<{ user: string; ai: string }[]>([]);
  const [isFileUploaded,setIsFileUploaded]=useState<"initial"|"uploaded"|"notuploaded">("initial");
  const [fileUploadSuccess,setIsFileUploadSuccess]=useState(false)
  const [isFocused,setIsFocused]=useState(false)
  const [isUserPromptDistable,setIsUserPromptDisable]=useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  

  const handleFileUpload = (file: File) => {
      setFileName(file.name);
      setStep("processing");
      setFileObject(file);
      setIsFileUploaded("uploaded");
      if (file!==undefined){
        setStep("complete");
        setIsFileUploadSuccess(true)
        setTimeout(() => {
          setIsFileUploadSuccess(false)
      }, 2500);
      }
  };
 
  const handleDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFileUpload(acceptedFiles[0]);
    }
  };
 
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    multiple: false,
    accept: {
          "application/pdf": [".pdf"],
    },
  });
 
  const resetUpload = () => {
    setStep("upload");
    setFileName("");
    setFileObject(undefined);
    setIsFileUploaded("initial");
  };
 
const handleSendMessage = () => {
  if (userchat.trim() !== "") {
    if (isFileUploaded!=="initial" && isFileUploaded!=="notuploaded"){
      setMessages((prevMessages) => [...prevMessages, { user: userchat, ai: "" }]);
    }
    setUserchat("");
    if (fileObject===undefined){
      setIsFileUploaded("notuploaded")
      setTimeout(()=>{
        setIsFileUploaded("initial")
      },2000)
      return 
    }else{
      makePostRequest();
    }
  }
  };


const makePostRequest = () => {
  const url = "https://pdf-qa.test.devapp.nyc1.initz.run/upload_pdf_and_ask";
  const formData = new FormData();
    if (fileObject!==undefined){
      formData.append('file', fileObject);
      formData.append('question', userchat);
      formData.append('streaming', 'true');
    }else{
      setIsFileUploaded("notuploaded");
    }
    setIsUserPromptDisable(true)
    const source = new SSE(url || "", {
      method: "POST",
      payload: formData,
    });

  source.addEventListener("message", (e: any) => {
      const promptValue = e.data;
      if (promptValue !== "[DONE]") {
        const payload = JSON.parse(promptValue);
        const newText = payload.choices[0].delta.content;
        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          return [
            ...prevMessages.slice(0, -1),
            { user: lastMessage.user, ai: lastMessage.ai + newText },
          ];
        });
      } else {
        setIsUserPromptDisable(false)
        source.close();
      }
    });
  
};


const renderMessages = () => {
  return messages.map((msg, index) => (
    <div key={index}>
      <div style={{display:'flex',justifyContent:'end'}}>
      <div style=
        {{                  
          padding: "0.5rem",
          borderRadius: "9px",
          background: "rgb(87, 94, 104,0.2)",
          minWidth: "200px",
          maxWidth: "480px",
          marginBottom: "1rem",
          color:'#FFFFFFB3',
          fontWeight:'300'
          }}>
        {msg.user}
      </div>
      </div>
      <div style={{display:'flex',justifyContent:'start'}}>
      <div style=
      {{ 
        padding: "0.5rem",
        borderRadius: "9px",
        background: "rgb(87, 94, 104,0.2)",
        minWidth: "200px",
        maxWidth: "480px",
        marginBottom: "1rem",
        color:'#FFFFFFB3',
        fontWeight:'300',
        display:'flex',
        flexDirection:'column',
        flexWrap:'wrap'
      }}
      className="markdownContainer"
      >
        {(msg.ai)?
         (<ReactMarkdown>
          {msg.ai}
         </ReactMarkdown>):
         (<BouncingDotsLoader/>)
        }
      </div>
      </div>
      <div ref={messagesEndRef} />
    </div>
  ));
};


 
const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };
 

const handlefocus=()=>{
  if (!isUserPromptDistable){
    setIsFocused(true)
  }
}

//To scrollup message automatically 
useEffect(() => {
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }
}, [messages]);


  return (
    <div>
      <div style={{ marginTop: "0.5rem", width: "100%", padding: "1rem 0.5rem"}}>
        <div
          style={{
            background: "rgb(25, 22, 34)",
            width: "80%",
            margin: "auto",
            maxHeight: "580px",
            overflowY: "auto",
            borderRadius: "9px",
            scrollbarWidth: "none",
            boxShadow:'rgba(0, 0, 0, 0.15) 0px 5px 15px 0px'
          }}
        >

              <div style=
              {{ width: "100%",
              position:'sticky',
              top:'0px',
              borderBottom:`0.1px solid ${customColors.lightgray}`,
              background: "rgb(25, 22, 34)",
              padding:'0.5rem',
              display:'flex',
              justifyContent:'space-between',
              alignItems:'center'
              }}>

                <div style={{width:'48%',paddingLeft:'1.5rem'}}>
                 <h1 style={{color: "rgb(115, 83, 229)" }}>Let Chat With PDF</h1>
                </div>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    padding: 1,
                    background:'rgb(25, 22, 34)',
                    width:'48%'
                  }}
                >
                  {step === "upload" && (
                    <Box
                      {...getRootProps()}
                      sx={{
                        border: "1px dashed #ccc",
                        padding:'0.5rem 1rem',
                        borderRadius: 2,
                        width: "60%",
                        // maxWidth: 400,
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "background-color 0.3s",
                      }}
                    >
                      <input {...getInputProps()} />
                      <div
                        style={{
                          height: "2rem",
                          width: "2rem",
                          background: "rgb(115, 83, 229)",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: "9px",
                          margin: "auto",
                        }}
                      >
                      <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24">
      <path fill="white" d="M9 16h6v-6h4l-7-7l-7 7h4zm-4 2h14v2H5z"></path>
    </svg>
                      </div>
                      <Typography variant="body2" sx={{color:'gray',marginTop:'1rem',fontFamily:'Poppins',fontSize:'0.8rem'}}>
                        Upload a PDF to ask AI
                      </Typography>
                    </Box>
                  )}


    
                  {step === "processing" && (
                    <>
                      <CircularProgress />
                      <Typography variant="h6" sx={{ marginTop: 2,color:'rgb(115, 83, 229)'}}>
                        Uploading {fileName}...
                      </Typography>
                    </>
                  )}

                 {fileUploadSuccess?step === "complete" && (
                     <>

                     <div style={{
                       position: 'fixed',
                       background:'rgb(25, 22, 34,0.9)',
                      // background:'red',
                       boxShadow:'rgba(0, 0, 0, 0.15) 0px 3px 3px 0px',
                       color: '#64bf6a',
                       transition: 'opacity 0.10s ease-in-out',
                       top: '2px',
                       left: '60%',
                       transform: 'translateX(-50%)',
                       padding: '10px 50px',
                       borderRadius: '5px',
                       zIndex: 1000
                     }}>
                       {fileName} uploaded successfully!
                     </div>

                     <Button sx={{ marginTop: 2,color:'rgb(115, 83, 229)',border:'1px solid rgb(115, 83, 229)',fontFamily:'Poppins'}} onClick={resetUpload}>
                      Upload Another File
                     </Button>
                   </>                     
                 ):step==="complete" && (
                  <>
                      <Typography sx={{color: customColors.lightgray }}>
                        {fileName} 
                      </Typography> 
                  <Button sx={{ marginTop: 1,color:'rgb(115, 83, 229)',border:'1px solid rgb(115, 83, 229)',fontFamily:'Poppins'}} onClick={resetUpload}>
                  Upload Another File
                  </Button>
                  </>
                 )}
  
                </Box>
              </div>
          
          <div style={{ minHeight: '400px' }}>
            {isFileUploaded === "initial" ? (
                  <div style={{ padding: '1.5rem' }}>
                            {renderMessages()}
                  </div>
            ) : isFileUploaded === "uploaded" ? (
              <div style={{ padding: '1.5rem' }}>
                {renderMessages()}
              </div>
            ) : isFileUploaded === "notuploaded" ? (
              <>
              <div style={{ padding: '1.5rem' }}>
               {renderMessages()}
              </div>
              <div style={{
                position: 'fixed',
                background:'rgb(25, 22, 34,0.9)',
                boxShadow:'rgba(0, 0, 0, 0.15) 0px 3px 3px 0px',
                color: '#f94449',
                transition: 'opacity 0.10s ease-in-out',
                top: '2px',
                left: '60%',
                transform: 'translateX(-50%)',
                padding: '10px 20px',
                borderRadius: '5px',
                zIndex: 1000
              }}>
                Please upload the file first...
              </div>
              </>
            ) : null} 
          </div>


          {/* Input and Send Button */}
          <div
            style={{
              width: "100%",
              margin: "auto",
              display: "flex",
              gap:'4px',
              justifyContent:'space-evenly',
              background: "rgb(25, 22, 34)",
              position:'sticky',
              bottom:'0rem',
              padding:'1rem',
              paddingBottom:'1rem'
            }}
          >
            <input
              type="text"
              style={{
                width: "82%",
                background: isUserPromptDistable?"rgb(99,99,99,0.2)":"rgb(25, 22, 34)",
                outline: "none",
                borderRadius:'9px',
                border:(isFocused)?`2px solid rgb(115, 83, 229)`:`0.1px solid ${customColors.lightgray}`,
                fontSize: "1rem",
                padding: "0.5rem 1rem",
                color:customColors.lightgray,
              }}
              placeholder="Your question here....."
              name="question"
              value={userchat}
              onKeyDown={handleKeyDown}
              onChange={(e) =>setUserchat(e.target.value)}
              onFocus={handlefocus}
              onBlur={() => setIsFocused(false)}
              disabled={isUserPromptDistable}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:'rgb(25, 22, 34)',
              }}
            >
              <Button
                style={{
                  background:isUserPromptDistable?"rgb(99,99,99,0.1)":"rgb(115, 83, 229)",
                  display: "flex",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                  borderRadius:'9px',
                  padding:'0.5rem 1rem',
                }}
              >
              <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24">
                <path fill="white" d="M5.536 21.886a1 1 0 0 0 1.033-.064l13-9a1 1 0 0 0 0-1.644l-13-9A1 1 0 0 0 5 3v18a1 1 0 0 0 .536.886"></path>
              </svg>
              <Typography style={{color:customColors.white,textTransform:'none',fontFamily:'Poppins',fontSize:'0.9rem',fontWeight:'300'}}>Submit</Typography>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default ChatWithPDF;
