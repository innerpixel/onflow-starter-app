<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>Your Flow address: {{ currentUser.loggedIn ? currentUser.addr : "Not logged in" }}</p>
    <p>Your profile: <pre>{{ userProfile && JSON.stringify(userProfile, null, 2)}}</pre>{{ !userProfile ? "No profile found." : '' }}</p>
    <button v-if="currentUser.loggedIn && !userProfile" @click="initProfile">
      Init Profile
    </button>
	
    <button v-if="!currentUser.loggedIn" @click="login">Login</button>
    <button v-if="currentUser.loggedIn" @click="logout">Logout</button>

  </div>
</template>

<script>
import * as fcl from "@onflow/fcl";
import * as types from "@onflow/types";
import { ref } from "vue";

import { initAccount } from "../../cadence/tx.init-account";
import { fetchProfile } from "../../cadence/script.get-profile";

const user = ref({});
const profile = ref();

fcl
  .config()
  .put("accessNode.api", "https://access-testnet.onflow.org")
  .put("challenge.handshake", "https://fcl-discovery.onflow.org/testnet/authn")
  .put("0xProfile", "0xba1132bc08f82fe2");

function login() {
  fcl.logIn();
}

function logout() {
  fcl.unauthenticate();
}

fcl.currentUser().subscribe(setUserData);

async function setUserData(fclUser) {
  user.value = fclUser;
  if (fclUser.addr && !profile.value)
    profile.value = await fetchProfile(fclUser.addr);
  if (!fclUser.addr) profile.value = "";
}

async function initProfile() {
  const result = await initAccount();
  profile.value = result;
}

async function getProfile(address) {
  const result = await fetchProfile(address);
  if (result) profile.value = result;
}

export default {
  name: "HelloFlow",
  data() {
    return {
      currentUser: user,
      userProfile: profile,
    };
  },
  props: {
    msg: String,
  },
  methods: {
    login,
    logout,
    initProfile,
  },
};
</script>

<style scoped>
.hello p {
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
}

button {
  font-size: 24px;
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  border-radius: 4px;
  border: none;
  border: 1px solid #222;
}

h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
