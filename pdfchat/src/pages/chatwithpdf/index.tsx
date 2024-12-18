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
import { handleError } from "@/components/commonComponents/handleError";
import toast, { Toaster } from 'react-hot-toast';
 
 
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
  const [loading,setLoading]=useState(false)
  

  const handleFileUpload = (file: File) => {
      setFileName(file.name);
      setStep("processing");
      setFileObject(file);
      setIsFileUploaded("uploaded");
      if (file!==undefined){
        setStep("complete");
        setIsFileUploadSuccess(true)
        toast.success("File uploaded successfully!", {
          style: {
            background: "rgb(0,0,0,0.3)",
            color: "#ccc",
          },
        })
        setTimeout(() => {
          setIsFileUploadSuccess(false)
      }, 2500);
      }else{
        toast.error("Some Error occurred!", {
          style: {
            background: "rgb(0,0,0,0.3)",
            color: "#ccc",
          },
        })
      }
  };
 
  const handleDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFileUpload(acceptedFiles[0]);
    }
  };
 
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    multiple: true,
    accept: {
          "application/pdf": [".pdf"],
    },
  });
 
  const resetUpload = () => {
    if (!isUserPromptDistable){
      setStep("upload");
      setFileName("");
      setFileObject(undefined);
      setIsFileUploaded("initial");
      setMessages([])
    }
  };
 
const handleSendMessage = () => {
  if (userchat.trim() !== "") {
    if (isFileUploaded!=="initial" && isFileUploaded!=="notuploaded"){
      setMessages((prevMessages) => [...prevMessages, { user: userchat, ai: "" }]);
    }
    setUserchat("");
    if (fileObject===undefined){
      setIsFileUploaded("notuploaded")
      toast.error("Please upload the file first!", {
        style: {
          background: "rgb(0,0,0,0.3)",
          color: "#ccc",
        },
      });
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
    setLoading(true)
    const url = "https://pdf-qa.test.devapp.nyc1.initz.run/upload_pdf_and_ask";
    const formData = new FormData();
    if (fileObject!==undefined){
      formData.append('file', fileObject);
      formData.append('question', userchat);
      formData.append('stream', 'true');
    }else{
      setIsFileUploaded("notuploaded");
    }
    try{
      setIsUserPromptDisable(true)
      const source = new SSE(url || "", {
        method: "POST",
        payload: formData,
      });
      source.addEventListener("error", (error: any) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(error.data, 'text/html');
        
        // Extract the text content
        const titleElement = doc.querySelector('title');
        const title = titleElement ? titleElement.textContent : '';
        setLoading(false)
        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          return [
            ...prevMessages.slice(0, -1),
            { user: lastMessage.user, ai: lastMessage.ai + title+": Something went wrong on our end. Please try again later." },
          ];
        });
        setIsUserPromptDisable(false);
        source.close();
      });
      try{
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
           setLoading(false)
           source.close();
         }
   
       });
     }catch(err){
        setIsUserPromptDisable(false)
        setLoading(false)
        console.log("error")
     }
    }catch(err:any){
          setIsUserPromptDisable(false)
          setLoading(false)
         console.log(handleError(err))
    }
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
         (loading?<BouncingDotsLoader/>:msg.ai)
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


//to clear the chat
const handleClear=()=>{
  if (!isUserPromptDistable){
    setMessages([])
  }
}

const contextClass = {
  success: "bg-gray-600",
  error: "bg-red-600",
  info: "bg-gray-600",
  warning: "bg-orange-400",
  default: "bg-indigo-600",
  dark: "bg-white-600 font-gray-300",
};


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
                 <h1 style={{color: "rgb(115, 83, 229)" }}>Chat With PDF</h1>
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

                     <Button 
                     sx={{ 
                     marginTop: 2,
                     border:'1px solid rgb(115, 83, 229)',
                     color:'rgb(115, 83, 229)',
                     fontFamily:'Poppins'}} 
                     onClick={resetUpload}
                     disabled={isUserPromptDistable}
                     >
                      Upload Another File
                     </Button>           
                 ):step==="complete" && (
                  <>
                      <Typography sx={{color: customColors.lightgray }}>
                        {fileName} 
                      </Typography> 
                  <Button sx={{ 
                    marginTop: 1,
                    color:isUserPromptDistable?customColors.lightgray:'rgb(115, 83, 229)',
                    border:isUserPromptDistable?'1px solid '+customColors.lightgray:'1px solid rgb(115, 83, 229)',
                    fontFamily:'Poppins'}} 
                    onClick={resetUpload}>
                  Upload Another File
                  </Button>
                  </>
                 )}
  
                </Box>
                <Toaster position="top-right"/>
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
              <Toaster position="top-right"/>
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
                gap:'4px',
                background:'rgb(25, 22, 34)',
              }}
            >
              <Button
                variant="contained"
                sx={{
                  background:isUserPromptDistable?"rgb(99,99,99,0.1)":"rgb(115, 83, 229)",
                  display: "flex",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                  borderRadius:'9px',
                  padding:'0.5rem 1rem',
                  '&:hover': {
                    backgroundColor: isUserPromptDistable?"rgb(99,99,99,0.1)":"rgb(115, 83, 229)", 
                  },
                }}
                onClick={handleSendMessage}
              >
              <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24">
                <path fill={isUserPromptDistable?customColors.lightgray:customColors.white} d="M5.536 21.886a1 1 0 0 0 1.033-.064l13-9a1 1 0 0 0 0-1.644l-13-9A1 1 0 0 0 5 3v18a1 1 0 0 0 .536.886"></path>
              </svg>
              <Typography style={{color:isUserPromptDistable?customColors.lightgray:customColors.white,textTransform:'none',fontFamily:'Poppins',fontSize:'0.9rem',fontWeight:'300'}}>Submit</Typography>
              </Button>
              <Button 
              sx={{
                color:'rgb(115, 83, 229)',
                textTransform:'none',
                fontFamily:'Poppins',
                '&:hover': {
                  backgroundColor: 'rgb(115, 83, 229,0.3)', 
                },
                '&.Mui-disabled': {
                  color: 'rgb(115, 83, 229,0.5)', 
                },
              }}
              onClick={handleClear}
              disabled={isUserPromptDistable}
              >   
                  Clear
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default ChatWithPDF;