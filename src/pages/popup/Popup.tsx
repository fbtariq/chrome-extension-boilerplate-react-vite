import React from 'react';
import GoogleButton from 'react-google-button';
import { Box, Text, Image } from "@chakra-ui/react";
import { signInWithGoogle } from "./index";
import logo from '../../assets/img/logo.svg'; // replace this with the path to your logo

export default function Popup() {
  return (
    <Box textAlign="center">
      <Image src={logo} alt="Extension Logo" marginBottom="1em" />
      <GoogleButton onClick={signInWithGoogle} />
      <Text fontSize="sm" marginTop="1em">
        Some text below the button
      </Text>
    </Box>
  );
}