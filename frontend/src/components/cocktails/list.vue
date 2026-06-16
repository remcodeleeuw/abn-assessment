<template>
  <div>
    <h1>Cocktails List</h1>
    <div style="margin-bottom: 20px;">
      <label for="search" style="margin-right: 10px;">Search by description:</label>
      <input type="text" id="search" v-model="searchQuery" @input="handleInput" style="padding: 5px; width: 300px;" />
    </div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <ul>
        <li v-for="item in data" :key="item.id">
          <router-link :to="`/${item.id}`">
            <span style="font-weight: bold">{{ item.title }}</span> price: {{ item.price }}€
          </router-link>
        </li>
      </ul>
    </div>

  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'CocktailList',
  setup() {
    const searchQuery = ref('');
    const data = ref([]);
    const loading = ref(true);
    const error = ref(null);
    let debounceTimer = null;

    const fetchData = async (query = '') => {
      console.log(`fetchData called with query: "${query}"`);
      loading.value = true;
      error.value = null;
      try {
        const url = query 
          ? `http://localhost:3000/cocktails?search=${encodeURIComponent(query)}` 
          : 'http://localhost:3000/cocktails';
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        console.log('fetchData success, received:', jsonData);
        data.value = jsonData;
      } catch (err) {
        console.error('fetchData error:', err);
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => fetchData());

    const handleInput = (event) => {
      const val = event.target.value;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchData(val);
      }, 300);
    };

    return {
      searchQuery,
      handleInput,
      data,
      loading,
      error,
    };
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>