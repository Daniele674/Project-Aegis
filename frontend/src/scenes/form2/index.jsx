import { Box, Button, TextField, Snackbar } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import axios from "axios";
import {useLocation, useNavigate} from 'react-router-dom';
import AlertTitle from '@mui/material/AlertTitle';
import Alert from '@mui/material/Alert';
import React, {useState, useContext} from 'react';
import {OrgContext} from "../../components/OrgContext";

const Form2 = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const {org,setOrg} = useContext(OrgContext);
  const location = useLocation();
  const data = location.state;
  const history= useNavigate();
  const [open, setOpen]= useState(false);
  const [alertData, setAlertData] = useState({
   severity: 'success', title:'Success', message:'Your log has been updated!'
  });
  
  const updateLog = async(log) => {
	try{
	console.log("sending log data:",log);
	const response = await axios.post('http://localhost:3001/invoke/UpdateLog',log,{
		headers:{
			'x-org':org
		}
	});
	console.log('log updated:',response.data);
	//alert('Log updated:');
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

  const handleFormSubmit = async (values) => {
    console.log(values);
    const delay = ms => new Promise(res => setTimeout(res,ms));
    await updateLog(values);
    await delay(2000);
    history(-1);
  };
  
  const handleClose= () =>{
  setOpen(false);
  };
  
  const initialValues = {
  sourceIP: data.log.source_ip,
  attackType:data.log.attack_type,
  severity:data.log.severity,
  description:data.log.description,
  id:data.log.id,
};

  return (
    <Box m="20px">
      <Header title="UPDATE LOG" subtitle="Update the chosen Log" />
      
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
                label="ID"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.id}
                name="id"
                disabled="true"
                error={!!touched.id && !!errors.id}
                helperText={touched.id && errors.id}
                sx={{ gridColumn: "span 2" }}
              />
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
              <Button type="submit" color="secondary" variant="contained">
                Update Log
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
  severity: yup.string().oneOf(['Low','Medium','High']).required("Acceptable Values are Low, Medium or High"),
  description: yup.string().nullable().notRequired(),
});


export default Form2;
