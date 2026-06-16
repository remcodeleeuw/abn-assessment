<template>
  <div>
    <form @submit.prevent="submitForm">
      <div v-if="error" class="alert alert-error">{{ error }}</div>
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
      },
      error: null
    };
  },
  methods: {
    async submitForm() {
      this.error = null;
      try {
        const response = await fetch('http://localhost:3000/cocktails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.form)
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = typeof errData.message === 'string' 
            ? errData.message 
            : (Array.isArray(errData.message) ? errData.message.join(', ') : 'Network response was not ok');
          throw new Error(errMsg);
        }

        const data = await response.json();
        console.log('Form submitted successfully:', data);
        // Clear the form
        this.form.title = '';
        this.form.price = '';
        this.form.description = '';
      } catch (error) {
        console.error('There was an error submitting the form:', error);
        this.error = error.message;
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
.alert {
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
  font-size: 14px;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>