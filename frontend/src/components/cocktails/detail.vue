<template>
  <div>
    <h1>Cocktail Details</h1>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else-if="data">
        <h2>Title: {{ data.title }}</h2>
        <p>Description: {{ data.description }}</p>
        <p>Price: {{ data.price }}€</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'CocktailDetail', 
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const data = ref(null);   
    const loading = ref(true);
    const error = ref(null);

    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/cocktails/${props.id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        console.log("Fetched cocktail data:", jsonData);
        data.value = jsonData;
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchData);

    return {
      data,
      loading,
      error,
    };
  },
};
</script>