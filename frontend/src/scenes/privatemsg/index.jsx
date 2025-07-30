import { Box, Button, TextField, Snackbar, useTheme, MenuItem } from "@mui/material";
import { Formik } from "formik";
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
  const [recipients, setRecipients] = useState([]);

  const [alertData, setAlertData] = useState({
    severity: 'success', title: 'Success', message: 'The message has been sent!'
  });

  // useEffect per caricare i DID dei possibili destinatari
  useEffect(() => {
    const getRecipientDids = async () => {
      try {
        // --- CORREZIONE 1: Usa i nomi MSP ID completi e corretti ---
        const orgsToFetch = ['Org1MSP', 'Org2MSP', 'Org3MSP'];
        
        const didPromises = orgsToFetch.map(orgName =>
          axios.get('http://localhost:3001/node/Status', { headers: { 'x-org': orgName } })
        );
        const responses = await Promise.all(didPromises);
        
        const allRecipients = responses.map(res => ({
            // FireFly restituisce l'MSP ID nel campo 'name' dello status
            name: res.data.org.name, // es. "Org1MSP"
            did: res.data.org.did
        }));

        // --- CORREZIONE 2: Filtra l'organizzazione corrente usando l'MSP ID ---
        // Ora il confronto 'Org1MSP' !== 'Org1MSP' funzionerà correttamente.
        const availableRecipients = allRecipients.filter(r => r.name !== org);
        setRecipients(availableRecipients);
        console.log("Destinatari disponibili:", availableRecipients);

      } catch (error) {
        console.error("Failed to fetch recipient DIDs", error);
        setRecipients([]);
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
    const payload = {
      did: values.did,
      tag: values.tag,
      topics: values.topics,
      log: { message: values.message }
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
        enableReinitialize // Permette a Formik di resettare i valori se `initialValues` cambia
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
                    // Mostriamo il nome (es. Org1MSP) ma usiamo il DID come valore
                    <MenuItem key={recipient.did} value={recipient.did}>
                        {recipient.name}
                    </MenuItem>
                ))}
              </TextField>
              
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

const initialValues = {
  did: "",
  message: "",
  tag: "",
  topics: "",
};

export default Form3;
