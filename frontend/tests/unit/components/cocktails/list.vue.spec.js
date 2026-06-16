import { shallowMount, flushPromises } from '@vue/test-utils';
import CocktailList from '@/components/cocktails/list.vue';

describe('CocktailList.vue', () => {
  const mockCocktails = [
    { id: 1, title: 'Mojito', description: 'Fresh mint and rum', price: 9 },
    { id: 2, title: 'Martini', description: 'Dry gin and vermouth', price: 10 }
  ];

  beforeEach(() => {
    jest.useFakeTimers();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    global.fetch.mockImplementationOnce(() => new Promise(() => { }));

    const wrapper = shallowMount(CocktailList, {
      global: { stubs: { RouterLink: { template: '<a><slot/></a>' } } }
    });

    expect(wrapper.text()).toContain('Loading...');
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/cocktails');
  });

  it('should render all cocktails after successful fetch on mount', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCocktails
    });

    const wrapper = shallowMount(CocktailList, {
      global: { stubs: { RouterLink: { template: '<a><slot/></a>' } } }
    });
    await flushPromises();

    expect(wrapper.text()).not.toContain('Loading...');
    const items = wrapper.findAll('li');
    expect(items.length).toBe(2);
    expect(items[0].text()).toContain('Mojito');
    expect(items[0].text()).toContain('price: 9€');
    expect(items[1].text()).toContain('Martini');
    expect(items[1].text()).toContain('price: 10€');
  });

  it('should trigger search query with debounce when typing in input', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCocktails
    });

    const wrapper = shallowMount(CocktailList, {
      global: { stubs: { RouterLink: { template: '<a><slot/></a>' } } }
    });
    await flushPromises();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockCocktails[0]]
    });

    const input = wrapper.find('#search');
    await input.setValue('Mojito');

    expect(global.fetch).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(305);
    await flushPromises();

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenLastCalledWith('http://localhost:3000/cocktails?search=Mojito');

    const items = wrapper.findAll('li');
    expect(items.length).toBe(1);
    expect(items[0].text()).toContain('Mojito');
  });

  it('should show error message when initial fetch fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    const wrapper = shallowMount(CocktailList, {
      global: { stubs: { RouterLink: { template: '<a><slot/></a>' } } }
    });
    await flushPromises();

    expect(wrapper.text()).not.toContain('Loading...');
    expect(wrapper.text()).toContain('HTTP error! status: 500');
  });
});
