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

const Form3 = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const {org, setOrg} = useContext(OrgContext);
  const [open, setOpen]= useState(false);
  const [did,setDid] = useState("");
  const [did2,setDid2] = useState("");
  const [did3, setDid3] = useState("");
  const [alertData, setAlertData] = useState({
   severity: 'success', title:'Success', message:'The message has been sent!'
  });
  
  useEffect(() => {
  const getDids = async() =>{
  const res1 = await axios.get('http://localhost:3001/node/Status',{
  	headers:{
  		'x-org':'MSP1'
  	}
  });
  setDid(res1.data.org.did);
  
  const res2 = await axios.get('http://localhost:3001/node/Status',{
  	headers:{
  		'x-org':'MSP2'
  	}
  
  });
  setDid2(res2.data.org.did);

  const res3 = await axios.get('http://localhost:3001/node/Status',{
  	headers:{
  		'x-org':'MSP3'
  	}
  });
  
  setDid3(res3.data.org.did);
  
  };
  getDids();
  }, []);
  
  const sendPrivateMsg = async(log) => {
	try{
	console.log("sending log data:",log);
	const response = await axios.post('http://localhost:3001/node/PrivateMessage',log, {
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
    const data = {
    	"did": values.did,
    	"tag": values.tag,
    	"topics":values.topics,
    	"log": {
    		"description":values.description,
    		"attackType": values.attackType,
    		"severity": values.severity,
    		"sourceIP": values.sourceIP,
    		"timestamp": new Date(),
    		"submitter": org
    	}
    	
    }
    sendPrivateMsg(data);
    resetForm();
  };

  const handleClose= () =>{
  setOpen(false);
  };

  return (
    <Box m="20px">
      <Header title="SUBMIT A MESSAGE" subtitle="Send a Private Message to another Node" />

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
              <Field
              fullWidth
              component="select"
              variant="outlined"
              onChange={handleChange}
              onBlur={handleBlur}
              name="did"
              value={values.did}
              error={!!touched.did && !!errors.did}
              helperText={touched.did && errors.did}
              style={{ gridColumn: "span 2", backgroundColor: colors.primary[400], color:colors.grey[100], border:"none", borderBottom: `1px solid`}}
              >
               <option value=""> -- Select a node -- </option>
               {org === 'MSP1' ? 
               <> <option value={did2}> MSP2 </option> <option value={did3}>MSP3</option></> 
               : org==='MSP2' ? 
               <> <option value={did}> MSP1 </option> <option value={did3}>MSP3</option> </>
               : <> <option value={did}> MSP1 </option> <option value={did2}>MSP2</option> </>}
              </Field>
              
               
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
  sourceIP: yup.string().required("required"),
  attackType: yup.string().required("required"),
  severity: yup.string().oneOf(['Low','Medium','High']).required("Acceptable Values are Low, Medium or High"),
  description: yup.string().nullable().notRequired(),
  tag: yup.string().nullable().notRequired(),
  topics: yup.string().required("required"),
  did: yup.string().required("required")
});

const initialValues = {
  sourceIP: "",
  attackType:"",
  severity:"",
  description:"",
  tag:"",
  topics:"",
  did:""
};

export default Form3;
