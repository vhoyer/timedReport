import { describe, it, expect } from 'vitest';
import { lazylet } from '@vhoyer/lazy-let';
import { render } from '@testing-library/vue';
import MyFooter from '../my-footer.vue';

describe('Components > Footer', () => {
  const $ = lazylet({
    wrapper: () => render(MyFooter),
  });

  it('renders correctly', () => {
    expect($.wrapper.container).toMatchSnapshot();
  });
});
