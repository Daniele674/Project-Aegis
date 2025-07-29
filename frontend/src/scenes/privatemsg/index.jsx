import { Box, Button, TextField, Snackbar, useTheme, MenuItem } from "@mui/material";
import { Formik, Field } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import axios from "axios";
import React, { useState, useContext, useEffect } from 'react';
import AlertTitle from '@mui/material/AlertTitle';
import Alert from '@mui/material/Alert';
import { OrgContext } from "../../components/OrgContext";
import { tokens } from "../../theme";

const Form3 = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { org } = useContext(OrgContext);
  const [open, setOpen] = useState(false);
  const [recipients, setRecipients] = useState([]); // Stato per memorizzare i destinatari

  const [alertData, setAlertData] = useState({
    severity: 'success', title: 'Success', message: 'The message has been sent!'
  });

  // useEffect per caricare i DID dei possibili destinatari
  useEffect(() => {
    const getRecipientDids = async () => {
      try {
        const orgsToFetch = ['MSP1', 'MSP2', 'MSP3'];
        const didPromises = orgsToFetch.map(orgName =>
          axios.get('http://localhost:3001/node/Status', { headers: { 'x-org': orgName } })
        );
        const responses = await Promise.all(didPromises);
        
        const allRecipients = responses.map(res => ({
            name: res.data.org.name, // es. "Org 1"
            did: res.data.org.did
        }));

        // Filtra l'organizzazione corrente dalla lista dei destinatari
        const availableRecipients = allRecipients.filter(r => r.name !== org);
        setRecipients(availableRecipients);

      } catch (error) {
        console.error("Failed to fetch recipient DIDs", error);
        // Potresti voler mostrare un errore all'utente qui
      }
    };
    getRecipientDids();
  }, [org]); // Riesegui se l'organizzazione dell'utente cambia

  const sendPrivateMsg = async (payload) => {
    try {
      console.log("Sending private message:", payload);
      const response = await axios.post('http://localhost:3001/node/PrivateMessage', payload, {
        headers: { 'x-org': org }
      });
      console.log('Message sent:', response.data);
      setAlertData({
        severity: 'success', title: 'Success', message: 'The private message has been sent!'
      });
      setOpen(true);
    } catch (error) {
      console.error('Error sending the message:', error);
      setAlertData({
        severity: 'error', title: 'Error', message: error.response?.data?.error || 'An error has occurred!'
      });
      setOpen(true);
    }
  };

  const handleFormSubmit = (values, { resetForm }) => {
    // Il backend si aspetta un campo "log" per il messaggio, quindi lo chiamiamo così
    const payload = {
      did: values.did,
      tag: values.tag,
      topics: values.topics,
      log: { message: values.message } // Struttura del messaggio semplice
    };
    sendPrivateMsg(payload);
    resetForm();
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box m="20px">
      <Header title="SEND PRIVATE MESSAGE" subtitle="Send a Private Message to a specific Node" />

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
              {/* Campo di selezione del destinatario */}
              <TextField
                select
                fullWidth
                variant="filled"
                label="Recipient"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.did}
                name="did"
                error={!!touched.did && !!errors.did}
                helperText={touched.did && errors.did}
                sx={{ gridColumn: "span 4" }}
              >
                <MenuItem value=""><em>-- Select a recipient --</em></MenuItem>
                {recipients.map(recipient => (
                    <MenuItem key={recipient.did} value={recipient.did}>
                        {recipient.name}
                    </MenuItem>
                ))}
              </TextField>
              
              {/* Campo del Messaggio */}
              <TextField
                fullWidth
                multiline
                rows={4}
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
              {/* Campi Tag e Topics */}
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
                Send Private Message
              </Button>
            </Box>
          </form>
        )}
      </Formik>
      <Snackbar open={open} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleClose} severity={alertData.severity} sx={{ width: '100%' }}>
          <AlertTitle>{alertData.title}</AlertTitle>
          {alertData.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Schema di validazione aggiornato per il nuovo form
const checkoutSchema = yup.object().shape({
  did: yup.string().required("A recipient is required"),
  message: yup.string().required("Message cannot be empty"),
  tag: yup
    .string()
    .matches(/^[a-zA-Z0-9_.-]+$/, "Tag can only contain valid characters")
    .max(64, "Tag is too long")
    .required("A tag is required"),
  topics: yup.string().required("A topic is required"),
});

// Valori iniziali aggiornati
const initialValues = {
  did: "",
  message: "",
  tag: "",
  topics: "",
};

export default Form3;
