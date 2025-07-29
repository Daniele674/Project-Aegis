import { Box, Button, TextField, Snackbar, Typography } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import axios from "axios";
import React, { useState, useContext, useRef } from 'react';
import AlertTitle from '@mui/material/AlertTitle';
import Alert from '@mui/material/Alert';
import { OrgContext } from "../../components/OrgContext";
import AttachFileIcon from '@mui/icons-material/AttachFile';

const Form = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const { org } = useContext(OrgContext);
  const [open, setOpen] = useState(false);
  const [alertData, setAlertData] = useState({
    severity: 'success', title: 'Success', message: 'The log has been added!'
  });
  const attachmentInputRef = useRef(null);

  // Questa funzione è già corretta per il backend con Multer.
  const submitLogWithAttachment = async (logData) => {
    // 1. FormData è il modo corretto per inviare file e dati di testo insieme.
    const formData = new FormData();

    // 2. Aggiungi i campi di testo. Il backend li troverà in `req.body`.
    formData.append('sourceIP', logData.sourceIP);
    formData.append('attackType', logData.attackType);
    formData.append('severity', logData.severity);
    formData.append('description', logData.description);

    // 3. Aggiungi l'allegato se presente. Il backend lo troverà in `req.file`.
    if (logData.attachment) {
      formData.append('attachment', logData.attachment, logData.attachment.name);
    }
    
    try {
      console.log("Invio dati log e allegato al backend...");
      
      // 4. Invia il FormData. Axios e il browser gestiranno l'header 'Content-Type'.
      const response = await axios.post('http://localhost:3001/invoke/AddLog', formData, {
        headers: {
          'x-org': org,
        }
      });

      console.log('Log e allegato caricati con successo:', response.data);
      
      setAlertData({
         severity: 'success', title:'Success', message:'The log has been added!'
      });
      setOpen(true);

    } catch (error) {
      console.error('Errore durante il caricamento:', error);
      setAlertData({
        severity: 'error', title: 'Error', message: 'An error has occurred!'
      });
      setOpen(true);
    }
  };

  const handleFormSubmit = (values, { resetForm }) => {
    submitLogWithAttachment(values);
    resetForm();
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box m="20px">
      <Header title="CREATE LOG" subtitle="Create a New Log" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
        enableReinitialize={true}
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

            {/* Sezione per l'upload dell'allegato */}
            <Box display="flex" alignItems="center" mt="20px">
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={() => attachmentInputRef.current?.click()}
                  startIcon={<AttachFileIcon />}
                >
                    Add Attachment
                </Button>
                <input
                    ref={attachmentInputRef}
                    type="file"
                    accept=".pdf,.pcap" // Limita i tipi di file
                    hidden
                    onChange={(event) => {
                        setFieldValue("attachment", event.currentTarget.files[0]);
                    }}
                />
                {/* Mostra il nome del file selezionato */}
                {values.attachment && (
                    <Typography ml="15px" variant="body1">
                        {values.attachment.name}
                    </Typography>
                )}
            </Box>

            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Create Log
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
  // L'allegato è opzionale e può essere nullo
  attachment: yup.mixed().nullable(),
});

const initialValues = {
  sourceIP: "",
  attackType: "",
  severity: "",
  description: "",
  // Valore iniziale per il campo dell'allegato
  attachment: null,
};

export default Form;
