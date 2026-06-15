<template>
  <div>
    <form @submit.prevent="submitForm">
      <div>
        <label for="title">Title:</label>
        <input type="text" v-model="form.title" id="title" required>
      </div>
      <div>
        <label for="price">Price:</label>
        <input type="number" v-model="form.price" id="price" required>
      </div>
      <div>
        <label for="description">Description:</label>
        <textarea v-model="form.description" id="description" required></textarea>
      </div>
      <button type="submit">Submit</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'ListCocktail',
  data() {
    return {
      form: {
        title: '',
        price: '',
        description: ''
      }
    };
  },
  methods: {
    async submitForm() {
      try {
        const response = await fetch('http://localhost:3000/cocktails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.form)
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Form submitted successfully:', data);
        // Clear the form
        this.form.title = '';
        this.form.price = '';
        this.form.description = '';
      } catch (error) {
        console.error('There was an error submitting the form:', error);
        // Handle the error (e.g., show an error message)
      }
    }
  }
};
</script>

<style scoped>
/* Optional: Add some basic styling */
form {
  max-width: 400px;
  margin: 0 auto;
}
div {
  margin-bottom: 10px;
}
label {
  display: block;
  margin-bottom: 5px;
}
input, textarea {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
</style>