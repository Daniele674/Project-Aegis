import { Box, Button, TextField, Snackbar } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import axios from "axios";
import React, {useRef, useState, useContext} from 'react';
import AlertTitle from '@mui/material/AlertTitle';
import Alert from '@mui/material/Alert';
import {OrgContext} from "../../components/OrgContext";

const Form = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const {org, setOrg} = useContext(OrgContext);
  const fileInputRef = useRef(null);
  const [open, setOpen]= useState(false);
  const [alertData, setAlertData] = useState({
   severity: 'success', title:'Success', message:'The log has been added!'
  });
  
  const uploadAndPublishLog = async(log) => {
	try{
	console.log("sending log data:",log);
	const response = await axios.post('http://localhost:3001/invoke/AddLog',log, {
		headers:{
			'x-org':org
		}
	});
	console.log('log uploaded and published:',response.data);
	//alert('Log uploaded and published with CID:');
	setOpen(true);
	} catch (error){
	console.error('error uploading',error);
	//alert('error uploading and publishing log');
	setAlertData({
	 severity:'error', title:'Error', message:'An error has occured!'
	});
	setOpen(true);
	}
};
  
  const handleFormSubmit = (values, {resetForm}) => {
    console.log(values);
    uploadAndPublishLog(values);
    resetForm();
  };

 const uploadFile = async(file) =>{
  try{
   const reader = new FileReader();
   reader.onload = async (event) =>{
    const jsonContent = JSON.parse(event.target.result);
    uploadAndPublishLog(jsonContent);
   };
   reader.readAsText(file);
  } catch (error) {
   console.error("Errore during l'upload:", error);
 }
};

  const handleClose= () =>{
  setOpen(false);
  };

  return (
    <Box m="20px">
      <Header title="CREATE LOG" subtitle="Create a New Log" />

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
                label="Source IP"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.sourceIP}
                name="sourceIP"
                error={!!touched.sourceIP && !!errors.sourceIP}
                helperText={touched.sourceIP && errors.sourceIP}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Attack Type"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.attackType}
                name="attackType"
                error={!!touched.attackType && !!errors.attackType}
                helperText={touched.attackType && errors.attackType}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Severity"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.severity}
                name="severity"
                error={!!touched.severity && !!errors.severity}
                helperText={touched.severity && errors.severity}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Description"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.description}
                name="description"
                error={!!touched.description && !!errors.description}
                helperText={touched.description && errors.description}
                sx={{ gridColumn: "span 4" }}
              />
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
             <Button 
              type="button" 
              color="secondary" 
              style={{marginRight: "10px"}} 
              variant="contained" 
              onClick={() => fileInputRef.current?.click()}>
             Upload Log
             </Button>
              <input
              ref={fileInputRef} 
              type="file"
              accept="application/json"
              style={{display: "none"}}
              onChange={(e) =>{
               const file=e.currentTarget.files[0];
               setFieldValue("file",file);
               uploadFile(file);
               }}
              />
              <Button type="submit" color="secondary" variant="contained">
                Create Log
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
  sourceIP: yup.string().required("required"),
  attackType: yup.string().required("required"),
  severity: yup.string().oneOf(['low','medium','high', 'critical']).required("Acceptable Values are low, medium, high or critical"),
  description: yup.string().nullable().notRequired(),
});

const initialValues = {
  sourceIP: "",
  attackType:"",
  severity:"",
  description:"",
  file: null
};

export default Form;
