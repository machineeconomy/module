<template>
  <div id="app">
    <Dashboard />
  </div>
</template>

<script>
import Dashboard from "./components/Dashboard.vue";

export default {
  name: "app",
  components: {
    Dashboard
  }

};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Open+Sans|Oswald:700&display=swap");

:root {
  --black: #171717;
  --dark: #15272e;
  --primary: #00b0f0;
  --light: #efefef;
  --white: #ffffff;

  --border: 5px solid var(--primary);
  --border_sm: 2px solid var(--primary);

  --transition: all 200ms ease-in-out;
  --transition-cubic: all 500ms cubic-bezier(0.17, 0.67, 0.65, 1);
  --transition-cubic_bounce: all 500ms cubic-bezier(0.17, 0.67, 0.65, 1.34);
}

body {
  margin: 0;
  padding: 0;
}

#app {
  background-color: var(--black);
  height: 100vh;
  width: 100%;
  overflow: hidden;
  color: var(--white);
}

h1,
h2,
h3,
h4 {
  margin: 0;
  font-weight: 700;
  font-family: "Oswald", sans-serif;
}

h1 {
  font-size: 46px;
}

p,
span {
  font-size: 16px;
  font-family: "Open Sans", sans-serif;
}

::-webkit-scrollbar {
  width: 10px;
  
}

/* Track */
::-webkit-scrollbar-track {
  background: rgba(0,0,0,.5); 
}
 
/* Handle */
::-webkit-scrollbar-thumb {
  background: var(--primary); 
  transition: var(--transition);
  border-radius: 5px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: var(--white); 
}

</style>
