/// <reference types="vite/client" />

import type { TestingLibraryMatchers } from 'testing-library__jest-dom/matchers'
declare global {
    namespace jest {
        // eslint-disable-next-line
        interface Matchers<R = void, T = {}> extends TestingLibraryMatchers<typeof expect.stringContaining, R> {}
    }
}
