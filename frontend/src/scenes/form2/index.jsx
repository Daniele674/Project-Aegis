import { Box, Button, TextField, Snackbar, Typography, useTheme } from "@mui/material"; // Aggiunto useTheme
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import axios from "axios";
import { useLocation, useNavigate } from 'react-router-dom';
import AlertTitle from '@mui/material/AlertTitle';
import Alert from '@mui/material/Alert';
import React, { useState, useContext, useRef } from 'react';
import { OrgContext } from "../../components/OrgContext";
import { tokens } from "../../theme"; // Aggiunto import di tokens
import AttachFileIcon from '@mui/icons-material/AttachFile';

const Form2 = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const { org } = useContext(OrgContext);
  const location = useLocation();
  const data = location.state;
  const history = useNavigate();
  const [open, setOpen] = useState(false);
  const [alertData, setAlertData] = useState({
    severity: 'success', title: 'Success', message: 'Your log has been updated!'
  });
  const attachmentInputRef = useRef(null);

  // --- CORREZIONE QUI ---
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Funzione per aggiornare i campi di testo del log
  const updateLog = async (log) => {
    try {
      await axios.post('http://localhost:3001/invoke/UpdateLog', log, {
        headers: { 'x-org': org }
      });
      setAlertData({ severity: 'success', title: 'Success', message: 'Log details have been updated!' });
      setOpen(true);
    } catch (error) {
      console.error('Error updating log:', error);
      setAlertData({ severity: 'error', title: 'Error', message: 'An error occurred while updating the log.' });
      setOpen(true);
      throw error;
    }
  };

  // Nuova funzione per aggiungere un allegato
  const addAttachment = async (logId, attachmentFile) => {
    const formData = new FormData();
    formData.append('logId', logId);
    formData.append('attachment', attachmentFile, attachmentFile.name);

    try {
        await axios.post('http://localhost:3001/invoke/AddAttachmentToLog', formData, {
            headers: { 'x-org': org }
        });
        setAlertData({ severity: 'success', title: 'Success', message: 'Attachment has been added!' });
        setOpen(true);
    } catch (error) {
        console.error('Error adding attachment:', error);
        setAlertData({ severity: 'error', title: 'Error', message: 'An error occurred while adding the attachment.' });
        setOpen(true);
        throw error;
    }
  };

  const handleFormSubmit = async (values) => {
    try {
        const { attachment, ...logData } = values;
        await updateLog(logData);
        if (attachment) {
            await addAttachment(logData.id, attachment);
        }
        await new Promise(res => setTimeout(res, 2000));
        history(-1);
    } catch (error) {
        console.log("Submit failed, not redirecting.");
    }
  };
  
  const handleClose = () => { setOpen(false); };
  
  const initialValues = {
    sourceIP: data.log.source_ip,
    attackType: data.log.attack_type,
    severity: data.log.severity,
    description: data.log.description,
    id: data.log.id,
    attachmentHash: data.log.attachmentHash,
    attachment: null,
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
            <Box display="grid" gap="30px" gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{ "& > div": { gridColumn: isNonMobile ? undefined : "span 4" } }}
            >
              <TextField fullWidth variant="filled" type="text" label="ID" value={values.id} name="id" disabled sx={{ gridColumn: "span 4" }} />
              <TextField fullWidth variant="filled" type="text" label="Source IP" onBlur={handleBlur} onChange={handleChange} value={values.sourceIP} name="sourceIP" error={!!touched.sourceIP && !!errors.sourceIP} helperText={touched.sourceIP && errors.sourceIP} sx={{ gridColumn: "span 2" }} />
              <TextField fullWidth variant="filled" type="text" label="Attack Type" onBlur={handleBlur} onChange={handleChange} value={values.attackType} name="attackType" error={!!touched.attackType && !!errors.attackType} helperText={touched.attackType && errors.attackType} sx={{ gridColumn: "span 2" }} />
              <TextField fullWidth variant="filled" type="text" label="Severity" onBlur={handleBlur} onChange={handleChange} value={values.severity} name="severity" error={!!touched.severity && !!errors.severity} helperText={touched.severity && errors.severity} sx={{ gridColumn: "span 2" }} />
              <TextField fullWidth variant="filled" type="text" label="Description" onBlur={handleBlur} onChange={handleChange} value={values.description} name="description" error={!!touched.description && !!errors.description} helperText={touched.description && errors.description} sx={{ gridColumn: "span 4" }} />
            </Box>

            <Box display="flex" alignItems="center" mt="20px">
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={() => attachmentInputRef.current?.click()}
                  startIcon={<AttachFileIcon />}
                >
                    {values.attachmentHash ? "Replace Attachment" : "Add Attachment"}
                </Button>
                <input
                    ref={attachmentInputRef}
                    type="file"
                    accept=".pdf,.pcap"
                    hidden
                    onChange={(event) => {
                        setFieldValue("attachment", event.currentTarget.files[0]);
                    }}
                />
                <Typography ml="15px" variant="body1" sx={{ color: colors.grey[300] }}>
                    {values.attachment 
                        ? `New: ${values.attachment.name}` 
                        : values.attachmentHash 
                        ? `Current: ${values.attachmentHash}` 
                        : "No attachment"}
                </Typography>
            </Box>

            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Update Log
              </Button>
            </Box>
          </form>
        )}
      </Formik>
      
      <Snackbar open={open} autoHideDuration={2000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
       <Alert onClose={handleClose} severity={alertData.severity} sx={{ width: '100%' }}>
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
  severity: yup.string().oneOf(['low', 'medium', 'high', 'critical']).required("Acceptable Values are low, medium, high or critical"),
  description: yup.string().nullable().notRequired(),
  attachment: yup.mixed().nullable(),
});

export default Form2;
