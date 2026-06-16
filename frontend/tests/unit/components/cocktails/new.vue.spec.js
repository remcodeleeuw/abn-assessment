import { shallowMount, flushPromises } from '@vue/test-utils';
import NewCocktail from '@/components/cocktails/new.vue';

describe('new.vue', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the form', () => {
    const wrapper = shallowMount(NewCocktail);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('#title').exists()).toBe(true);
    expect(wrapper.find('#price').exists()).toBe(true);
    expect(wrapper.find('#description').exists()).toBe(true);
  });

  it('should submit form data successfully and display success message', async () => {
    const mockResponse = { id: 10, title: 'Mojito' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const wrapper = shallowMount(NewCocktail);

    await wrapper.find('#title').setValue('Mojito');
    await wrapper.find('#price').setValue(9);
    await wrapper.find('#description').setValue('Yummy');

    await wrapper.find('form').trigger('submit.prevent');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/cocktails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Mojito', price: 9, description: 'Yummy' }),
    });

    await flushPromises();

    expect(wrapper.find('.alert-success').text()).toContain('successfully created!');
    expect(wrapper.vm.form.title).toBe('');
    expect(wrapper.vm.form.price).toBe('');
    expect(wrapper.vm.form.description).toBe('');
  });

  it('should display error message when submission fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Cocktail with title "Mojito" already exists' }),
    });

    const wrapper = shallowMount(NewCocktail);

    await wrapper.find('#title').setValue('Mojito');
    await wrapper.find('#price').setValue(9);
    await wrapper.find('#description').setValue('Yummy');

    await wrapper.find('form').trigger('submit.prevent');

    await flushPromises();

    expect(wrapper.find('.alert-error').text()).toContain('Cocktail with title "Mojito" already exists');
    expect(wrapper.vm.form.title).toBe('Mojito');
  });
});
