import { Box, Button, TextField, Snackbar, useTheme } from "@mui/material";
import { Formik, Field } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import axios from "axios";
import React, {useRef, useState, useContext, useEffect} from 'react';
import AlertTitle from '@mui/material/AlertTitle';
import Alert from '@mui/material/Alert';
import {OrgContext} from "../../components/OrgContext";
import { tokens } from "../../theme";

const Form4 = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const {org, setOrg} = useContext(OrgContext);
  const fileInputRef = useRef(null);
  const [open, setOpen]= useState(false);
  const [alertData, setAlertData] = useState({
   severity: 'success', title:'Success', message:'The message has been sent!'
  });
   
  const sendBroadcastMsg = async(log) => {
	try{
	console.log("sending log data:",log);
	const response = await axios.post('http://localhost:3001/node/BroadcastMessage',log, {
		headers:{
			'x-org':org
		}
	});
	console.log('message sent:',response.data);
	//alert('Log uploaded and published with CID:');
	setOpen(true);
	} catch (error){
	console.error('error in sending the msg',error);
	//alert('error uploading and publishing log');
	setAlertData({
	 severity:'error', title:'Error', message:'An error has occured!'
	});
	setOpen(true);
	}
};
  
  const handleFormSubmit = (values, {resetForm}) => {
    console.log(values);
    sendBroadcastMsg(values);
    resetForm();
  };

  const handleClose= () =>{
  setOpen(false);
  };

  return (
    <Box m="20px">
      <Header title="SUBMIT A MESSAGE" subtitle="Send a Broadcast Message to all Nodes" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
             
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Message"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.message}
                name="message"
                error={!!touched.message && !!errors.message}
                helperText={touched.message && errors.message}
                sx={{ gridColumn: "span 4" }}
              />
               <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Tag"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.tag}
                name="tag"
                error={!!touched.tag && !!errors.tag}
                helperText={touched.tag && errors.tag}
                sx={{ gridColumn: "span 2" }}
              />
               <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Topics"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.topics}
                name="topics"
                error={!!touched.topics && !!errors.topics}
                helperText={touched.topics && errors.topics}
                sx={{ gridColumn: "span 2" }}
              />
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Send Message
              </Button>
            </Box>
          </form>
        )}
      </Formik>
       <Snackbar open={open} autoHideDuration="2000" onClose={handleClose} anchorOrigin={{vertical:'top', horizontal:'center'}}>
       <Alert onClose={handleClose} severity={alertData.severity} sx={{width: '100%'}}>
        <AlertTitle>{alertData.title}</AlertTitle>
        {alertData.message}
       </Alert>
      </Snackbar>
    </Box>
  );
};

const checkoutSchema = yup.object().shape({
  message: yup.string().required("required"),
  tag: yup.string().nullable().notRequired(),
  topics: yup.string().required("required"),
});

const initialValues = {
  tag:"",
  topics:"",
  message:""
};

export default Form4;
