<template lang="pug">
  div Google Oauth
    GoogleSignInButton( @success="handleLoginSuccess" @error="handleLoginError")
    div {{user}}
</template>

<script setup lang="ts">
import {  GoogleSignInButton,  type CredentialResponse,} from "vue3-google-signin"
const emit = defineEmits(['update_access_token'])

// handle success event
const handleLoginSuccess = (response: CredentialResponse) => {
  const { credential } = response;
  emit('update_access_token', credential)
};

// handle an error event
const handleLoginError = () => {
  console.error("Login failed");
};
</script>