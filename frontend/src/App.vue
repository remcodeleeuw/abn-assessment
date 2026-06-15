<template>
  <div id="app">
    <nav>
      <ul>
        <li><router-link to="/">List</router-link></li>
        <li><router-link to="/new">new cocktail</router-link></li>
      </ul>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
/* Add your global styles here */
</style>