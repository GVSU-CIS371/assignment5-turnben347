<template>
  <div>
    <Beverage :isIced="store.currentTemp === 'Cold'" />
    
    <input v-model="store.currentBeverageName" type="text" placeholder="Name" />

    <button @click="makeBeverageClick" :disabled="!store.user">Make Beverage</button>

    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>

    <div v-if="store.user" id="user-info">
      Signed in as: {{ store.user.displayName || store.user.email }}
    </div>

    <div id="beverage-container">
      <label v-for="beverage in store.beverages" v-if="store.user" :key="beverage.id">
        <input type="radio" name="saved" @click="store.showBeverage(beverage)" />
        {{ beverage.name }}
      </label>
    </div>

    <ul>
      <li>
        <label v-for="temp in store.temps" :key="temp">
          <input type="radio" name="temperature" :value="temp" v-model="store.currentTemp" />
          {{ temp }}
        </label>
      </li>
      <li>
        <label v-for="beverage in store.bases" :key="beverage.id">
          <input type="radio" name="base" :value="beverage" v-model="store.currentBase" />
          {{ beverage.name }}
        </label>
      </li>
      <li>
        <label v-for="cream in store.creamers" :key="cream.id">
          <input type="radio" name="creamer" :value="cream" v-model="store.currentCreamer" />
          {{ cream.name }}
        </label>
      </li>
      <li>
        <label v-for="syrup in store.syrups" :key="syrup.id">
          <input type="radio" name="syrup" :value="syrup" v-model="store.currentSyrup" />
          {{ syrup.name }}
        </label>
      </li>
    </ul>

    <div style="margin-top: 20px;">
      <button v-if="!store.user" @click="signInClick">Sign in with Google</button>
      <button v-else @click="signOutClick">Sign Out</button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { auth } from "./firebase";
import { useBeverageStore } from "./stores/beverageStore";
import Beverage from "./components/Beverage.vue";

const store = useBeverageStore();
const message = ref<string>("");
const messageType = ref<string>("");

onMounted(async () => {
  await store.init();

  auth.onAuthStateChanged(async (firebaseUser) => {
    await store.setUser(firebaseUser);
  });
});

const signInClick = async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (error: any) {
    if (error.code !== "auth/popup-closed-by-user") {
      message.value = `Error: ${error.message}`;
      messageType.value = "error";
      setTimeout(() => {
        message.value = "";
      }, 3000);
    }
  }
};

const signOutClick = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    message.value = `Error: ${error.message}`;
    messageType.value = "error";
  }
};

const makeBeverageClick = async () => {
  const result = await store.makeBeverage();
  message.value = result;
  messageType.value = result.includes("successfully") ? "success" : "error";
  
  setTimeout(() => {
    message.value = "";
  }, 3000);
};
</script>

<style lang="scss">
body,
html {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #6e4228;
  background: linear-gradient(to bottom, #6e4228 0%, #956f5a 100%);
}

ul {
  list-style: none;
}

#user-info {
  color: white;
  font-size: 14px;
  margin-top: 20px;
}

#beverage-container {
  margin: 20px 0;

  label {
    display: block;
    margin: 8px 0;
    color: white;
    cursor: pointer;

    input[type="radio"] {
      margin-right: 8px;
      cursor: pointer;
    }
  }
}

.message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;

  &.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  &.error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
