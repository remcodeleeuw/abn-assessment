import { shallowMount, flushPromises } from '@vue/test-utils';
import CocktailDetail from '@/components/cocktails/detail.vue';

describe('CocktailDetail.vue', () => {
  const testId = '42';
  const mockCocktail = {
    title: 'Mojito',
    description: 'Refreshing mint cocktail',
    price: 8.5
  };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render and receive the id from props', () => {
    global.fetch.mockImplementationOnce(() => new Promise(() => {}));
    
    const wrapper = shallowMount(CocktailDetail, {
      props: { 
        id: testId 
      }
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.props().id).toBe(testId);
  });

  it('should show loading state initially', () => {
    global.fetch.mockImplementationOnce(() => new Promise(() => {}));

    const wrapper = shallowMount(CocktailDetail, {
      props: { id: testId }
    });

    expect(wrapper.text()).toContain('Loading...');
    expect(global.fetch).toHaveBeenCalledWith(`http://localhost:3000/cocktails/${testId}`);
  });

  it('should render cocktail details after successful fetch', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCocktail
    });

    const wrapper = shallowMount(CocktailDetail, {
      props: { id: testId }
    });

    await flushPromises();

    expect(wrapper.text()).not.toContain('Loading...');
    expect(wrapper.find('h2').text()).toBe(`Title: ${mockCocktail.title}`);
    expect(wrapper.text()).toContain(`Description: ${mockCocktail.description}`);
    expect(wrapper.text()).toContain(`Price: ${mockCocktail.price}€`);
  });

  it('should render error message when fetch fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    const wrapper = shallowMount(CocktailDetail, {
      props: { id: testId }
    });

    await flushPromises();

    expect(wrapper.text()).not.toContain('Loading...');
    expect(wrapper.text()).toContain('HTTP error! status: 404');
  });
});