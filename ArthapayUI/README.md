# Artha Pay

This Document provides a comprehensive guide to setting up and understanding the project.

## Table of Contents

*   [Introduction](#introduction)
*   [Target Audience](#target-audience)
*   [Software Requirements](#software-requirements)
*   [Development Environment Setup](#development-environment-setup)
*   [Technology Stack Versions](#technology-stack-versions)
*   [Folder Structure](#folder-structure)
*   [File Naming and Conventions](#file-naming-and-conventions)
*   [Key Components and Functionality](#key-components-and-functionality)
*   [API Endpoint Configuration](#api-endpoint-configuration)
*   [State Management](#state-management)
*   [Routing](#routing)
*   [Styling](#styling)
*   [Error Handling](#error-handling)
*   [Optimization Techniques](#optimization-techniques)
*   [Security Considerations and Best Practices](#security-considerations-and-best-practices)
*   [Version Control and Branching Strategy](#version-control-and-branching-strategy)


## 1. Introduction <a id="introduction"></a>

Artha Pay is a cryptocurrency platform that allows users to buy, sell, manage vaults (fiat and crypto), create bank accounts, generate invoices, and process batch payouts in both fiat and cryptocurrency. This guide is intended for developers, QA engineers, and anyone involved in setting up the development environment.

## 2. Target Audience <a id="target-audience"></a>

This document is intended for developers, QA engineers, and anyone involved in setting up the development environment for the Artha Pay platform.

## 3. Software Requirements <a id="software-requirements"></a>

- **Node.js and npm (or yarn):**
  - Node.js: Version 18.x (LTS recommended) or later. Download from: [nodejs.org](https://nodejs.org/en/download)
  - npm: Version 9.x or later (included with Node.js).
- **Operating System:**
  - Windows 10/11, macOS Monterey/Ventura/Sonoma, Ubuntu 20.04/22.04 LTS (or other common Linux distributions). Specific instructions for certain OSs will be noted where applicable.
- **Text Editor/IDE:**
  - Recommended: VS Code with the following extensions:
    - ESLint (for linting JavaScript/JSX)
    - Prettier (for code formatting)
    - React Developer Tools (for debugging React components in your browser)
    - Tailwind CSS IntelliSense (for Tailwind CSS support)
- **Browser:**
  - Chrome (latest version), Firefox (latest version), Safari (latest version), Edge (latest version). The application is tested and optimized for these modern browsers.
- **Git:**
  - Git is required for version control. Download and install from: [git-scm.com](https://git-scm.com/downloads)

## 4. Development Environment Setup <a id="development-environment-setup"></a>

1.  **Clone the Repository:**

    ```bash
    git clone <repository_url> Arthapay
    ```

    _(Replace `<repository_url>` with the actual repository URL)_

2.  **Navigate to the Project Directory:**

    ```bash
    cd ArthapayUI
    ```

3.  **Install dependencies:**

    ```bash
    npm install --force  # or npm i --force
    ```

4.  **Environment Variables and Configuration (Vite Specific):**

    Vite uses a specific convention for environment variables. Variables intended for the client-side (browser) _must_ be prefixed with `VITE_`.

    This project utilizes separate `.env` files for different environments:

    - `.env.development`: For local development.
    - `.env.testing`: For testing environments.
    - `.env.production`: For the production environment.

    **Crucially:** You will need to create the appropriate `.env` file for your environment. Start by copying the `.env.example` file (if you have one) and renaming it to the correct environment name (e.g., `.env.development`).

    All environment-specific configurations, including API endpoints, Auth0 connection details, important keys, and other sensitive information, are stored in these `.env` files. It is essential to configure these values correctly based on your target environment.

    **Example `.env.development` file:**

    ```
    VITE_API_URL=http://localhost:8080/api  # Your local backend API URL
    VITE_AUTH0_DOMAIN=your_auth0_domain
    VITE_AUTH0_CLIENT_ID=your_auth0_client_id
    # ... other development environment variables ...
    ```

    **Example `.env.testing` file:**

    ```
    VITE_API_URL=[https://testing-api.example.com/api](https://testing-api.example.com/api)  # Testing API URL
    VITE_AUTH0_DOMAIN=your_testing_auth0_domain
    VITE_AUTH0_CLIENT_ID=your_testing_auth0_client_id
    # ... other testing environment variables ...
    ```

    **Example `.env.production` file:**

    ```
    VITE_API_URL=[https://api.example.com/api](https://api.example.com/api)  # Production API URL
    VITE_AUTH0_DOMAIN=your_production_auth0_domain
    VITE_AUTH0_CLIENT_ID=your_production_auth0_client_id
    # ... other production environment variables ...
    ```

    **Accessing Environment Variables in your React Code:**

    You access these variables using `import.meta.env`:

    ```javascript
    const apiUrl = window.runtimeConfig.VITE_API_URL;
    console.log("API URL:", apiUrl); // Output the API URL
    ```

5.  **Build Commands:**

    - Development Build: `npm run build:dev`
    - Testing build: `npm run build:testing`
    - Production build: `npm run build:prod`

## 5. Technology Stack Versions <a id="technology-stack-versions"></a>

- React: v18.3.1
- Ant Design (antd): Latest
- Tailwind CSS: Latest
- Vite: Latest
- Redux Toolkit: Latest
- React Router: Latest
- I18 (multilingual)
- Apisauce

## 6. Folder structure <a id="folder-structure"></a>

- **`public/`:** Contains static assets served directly to the browser.

  - `locales/`: Translation files for internationalization (i18n).
  - `web.config`: Web server configuration (if applicable).

- **`src/`:** Contains the main source code of the application.

  - **`assets/`:** Images, fonts, and other static assets.
  - **`core/`:** Core application logic, components, and services.
    - `authentication/`: User authentication-related code.
    - `layout/`: Reusable layout components.
    - `shared/`: Reusable components, hooks, and utilities.
    - `onboarding/`: User onboarding components and logic.
    - `skeletons/`: Placeholder UI components for loading states.
    - `profile/`: User profile components and logic.
  - **`hooks/`:** Custom React hooks.
  - **`modules/`:** Feature-specific modules.
    - `cards/`, `banks/`, `payments/`, `payees/`, `exchange/`, `market/`, `notifications/`, `team/`, `transactions/`, `wallets/`: Each directory represents a specific feature or section of the application.
  - **`reducers/`:** Redux reducers (if Redux is used).
  - **`store/`:** Redux store configuration (if Redux is used).
  - **`utils/`:** Utility functions and helper methods.
  - **`App.jsx`:** The main application component.
  - **`Index.jsx`:** Entry point of the React application.
  - **`index.css`:** Global CSS styles.
  - **`input.css`:** CSS styles for input elements.

- **`.env` files:** Environment-specific configuration files (e.g., `.env.development`, `.env.production`). These files store sensitive information like API keys and URLs.

- **`vite.config.js`:** Vite build tool configuration.

- **`package.json`:** Project metadata, dependencies, and scripts.

- **`index.html`:** Main HTML file.

- **`tailwind.config.js`:** Tailwind CSS configuration.

## 7. File namings and conventions <a id="file-naming-and-conventions"></a>

- **Component Files:**
  - React components are named using PascalCase (e.g., `AccountSummary.jsx`, `TransactionList.jsx`).
  - File extensions are `.jsx` for components containing JSX, and `.js` for plain JavaScript files.
  - When using multiple sections inside a component, use the `. `notation. For example `account.summary.jsx` or `transaction.list.item.jsx`.
- **Style Files:**
  - Tailwind CSS classes are used directly within the component files.
  - If component-specific CSS files are needed, most of them are named using kebab-case and a `.css` extension, for example `account-summary.css`.

## 8. Key Components and Functionality <a id="key-components-and-functionality"></a>

This section describes the key components and their functionalities within the Artha Pay platform:

- **Header:** Displays the navigation bar, providing access to different sections of the application.
- **ProtectedRoute:** Protects specific routes from unauthorized access. Users must be authenticated to access these routes.
- **SessionHandler:** Manages all session-related activities, including user login, logout, and session persistence.
- **Onboarding:** Guides new users through the initial setup process, collecting necessary information and configuring their accounts.
- **ActionController:** Controls user actions based on the user account's status. This might restrict certain functionalities until an account is verified or fully set up.
- **CallbackHandler:** Handles callback routes, typically used for authentication flows (e.g., OAuth).
- **ListDetailLayout:** Provides a common layout structure across the application, especially for pages that display lists of items and their details. This ensures consistency and improves user experience.
- **PageHeader:** Displays breadcrumbs (navigation trail), a theme changer (allowing users to customize the app's appearance), and notifications.
- **AppRoutes:** Centralized location for defining all application routes, making it easier to manage navigation and URL structure.

## 9. API Endpoint Configuration <a id="api-endpoint-configuration"></a>

All API base URLs are stored in environment files (e.g., `.env.development`, `.env.production`). This allows for easy switching between different API environments. Environment variables are accessed using `window.runtimeConfig.VITE_API_END_POINT` (or similar, depending on the specific environment variable name).

### HTTP Clients and Services 

The API integration is structured using HTTP clients and services, located in the `core` directory and within each module.

- **`core/httpClients.js` (or similar):** This file defines reusable HTTP client instances using `apisauce` (or a similar library). It handles:

  - Base URL configuration (from environment variables).
  - Request interceptors for adding authorization tokens (e.g., JWT) to requests. This is typically done using `store.getState()` to access the token from the application's state.
  - Common HTTP methods (GET, POST, PUT, DELETE) wrapped in functions for easy use. These functions might also handle common response processing (e.g., error handling, data transformation).

- **`modules/<module_name>/httpServices.js` (or similar):** These files contain functions that interact with specific API endpoints related to a particular module. They use the HTTP client defined in `core/httpClients.js`. Crucially, these service functions separate the API call logic from the React components. They accept callback functions (`onSuccess`, `onError`) to handle the results of the API call within the components, promoting cleaner separation of concerns.

### Example API Integration

```javascript
// core/httpClients.js
import { create } from "apisauce";
import { store } from "../store"; // If using Redux or similar
import { deriveErrorMessage } from "./shared/deriveErrorMessage"; // Utility function

const createApiClient = (baseURL) => {
  const client = create({ baseURL });

  client.axiosInstance.interceptors.request.use((config) => {
    const token = store.getState().oidc?.deviceToken; // Example: Accessing token from Redux store
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
};

const apiClient = createApiClient(window.runtimeConfig.VITE_API_END_POINT); // Using environment variable

const createRequest = (client) => ({
  get: async (url, throwErrorOnNoContent = false) => {
    /* ... */
  }, // Implementation
  post: async (url, data) => {
    /* ... */
  }, // Implementation
  put: async (url, data) => {
    /* ... */
  }, // Implementation
  delete: async (url) => {
    /* ... */
  }, // Implementation
});

const appClientMethods = createRequest(apiClient); // Or a different client if needed (e.g. for Web3)

export default appClientMethods; // Export the methods

// modules/someModule/httpServices.js
import appClientMethods from "../core/httpClients"; // Import the client

const commonController = "/api/v1/common/"; // Example path

export const getCountriesAndTowns = async (onSuccess, onError) => {
  try {
    const response = await appClientMethods.get(
      `${commonController}countrytownlu`
    );
    onSuccess(response);
  } catch (error) {
    onError?.(error.message); // Call onError if provided
  }
};

// modules/someModule/SomeComponent.jsx
import { getCountriesAndTowns } from "./httpServices";

const SomeComponent = () => {
  const handleSuccess = (data) => {
    // Process data from API call
    console.log(data);
  };

  const handleError = (error) => {
    // Handle error
    console.error(error);
  };

  const fetchData = () => {
    getCountriesAndTowns(handleSuccess, handleError);
  };

  // ... rest of component
};
```

## 10. State Management <a id="state-management"></a>

This section describes the state management strategy employed in the Artha Pay platform. We primarily utilize Redux Toolkit for its robust and scalable approach, with occasional use of React's Context API for simpler, localized state management.

### State Management Libraries

- **Redux Toolkit (`@reduxjs/toolkit`):** Our primary state management solution. Redux Toolkit simplifies Redux development and provides best practices for managing complex application state.
- **React Context API:** Used sparingly for less frequently changing state that's confined to a specific component subtree (e.g., theming).

#### Redux Toolkit Implementation 

#### Store Structure (`src/store/store.js`)

The Redux store is configured in `src/store/store.js` using `configureStore` from Redux Toolkit. It combines all the application's reducers.

```javascript
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../reducers/authSlice";
import walletReducer from "../reducers/walletSlice";
// ... other reducers ...

const store = configureStore({
  reducer: {
    auth: authReducer,
    wallet: walletReducer,
    // ... other reducers ...
  },
});

export default store;
```

#### Reducers and Actions (Slices - `src/reducers/`) 

Reducers are organized into "slices" within the `src/reducers` directory. Each slice manages the state for a specific feature. `createSlice` from Redux Toolkit defines reducers, actions, and initial state within a single file. `createAsyncThunk` is used for asynchronous actions (e.g., API calls).

#### `authSlice.js`

```javascript
// src/reducers/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginApi } from "../core/authService"; // Example API service

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginApi(credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    /* ... */
  }, // Initial state for auth
  reducers: {
    logout: (state) => {
      /* ... */
    }, // Synchronous action
  },
  extraReducers: (builder) => {
    // Handles async thunk actions
    builder
      .addCase(loginUser.pending, (state) => {
        /* ... */
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        /* ... */
      })
      .addCase(loginUser.rejected, (state, action) => {
        /* ... */
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
```

#### `walletSlice.js`

```javascript
import { createSlice } from "@reduxjs/toolkit";

const walletSlice = createSlice({
  name: "wallet",
  initialState: {},
  reducers: {
    updateBalance: (state, action) => {},
    addTransaction: (state, action) => {},
  },
});

export const { updateBalance, addTransaction } = walletSlice.actions;
export default walletSlice.reducer;
```

## 11. Routing <a id="routing"></a>

This section describes the routing strategy used in the Artha Pay platform, utilizing React Router v7 and `createBrowserRouter`.

### Routing Library

We use React Router v7 and specifically `createBrowserRouter` for managing navigation and routing. This approach provides a more declarative and efficient way to define routes.

### Route Configuration

Routes are defined using the `createBrowserRouter` function. This function takes an array of route objects as its argument. Each route object defines the path and the component to render for that path.

```javascript
// src/AppRoutes.jsx (Example)
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import VaultsCryptoDeposit from "./modules/wallets/crypto/VaultsCryptoDeposit";
import VaultsCryptoWithdraw from "./modules/wallets/crypto/VaultsCryptoWithdraw";
import Dashboard from "./modules/dashboard/Dashboard";
import Transactions from "./modules/transactions/Transactions";
// ... other imports

const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />, // Dashboard screen
  },
  {
    path: "/wallets/crypto/deposit",
    element: <VaultsCryptoDeposit />, // Crypto Vault Deposit screen
  },
  {
    path: "/wallets/crypto/withdraw",
    element: <VaultsCryptoWithdraw />, // Crypto Vault Withdraw screen
  },
  {
    path: "/transactions",
    element: <Transactions />, // Transactions Screen
  },
  // ... other routes ...
  {
    path: "*", // Catch-all route for 404s
    element: <div>Page Not Found</div>,
  },
]);
```

## 12. Styling <a id="styling"></a>

This section describes the styling approach used in the Artha Pay platform.

### Styling Approach

We primarily use Tailwind CSS for styling the entire application. Tailwind CSS provides a utility-first approach, allowing us to rapidly style elements by applying pre-defined CSS classes directly in our HTML (JSX).

For specific customizations or styles not easily achievable, we use traditional CSS, organized in `index.css` and following a naming convention (e.g., `custom-flex`). This approach allows us to add small, targeted CSS rules without interfering with Tailwind's utility-first system.

### Global Styles (`index.css`)

`index.css` contains global styles and customizations. It is included in the application's main entry point (`index.jsx` or similar) and therefore affects all components. We use a naming convention like `custom-flex`, `custom-margin` etc. for any custom classes in this file.

```css
.custom-flex {
  display: flex;
}

.custom-margin {
  margin: 10px;
}
```

### Component-Specific Styles

Because we primarily use **Tailwind CSS**, most component styling is done directly within the component's JSX using Tailwind's utility classes. This approach scopes the styles to the component where they are used, avoiding CSS conflicts and improving maintainability.

#### Example Component

```javascript
// ExampleComponent.jsx
const ExampleComponent = () => {
  return (
    <div className="bg-gray-100 p-4 rounded-md shadow-sm">
      {" "}
      {/* Tailwind classes */}
      <p className="text-lg font-medium">Example Text</p>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Click me
      </button>
    </div>
  );
};
```

### Icon Styling

We use SVG icons and display them by setting the `background-position` property of an element. The coordinates for each icon are stored in central icon files (`darktheme-icons.svg, lighttheme-icons.svg in src/assets/images`).

```css
.icon.sm.bc-arrow {
  background-position: -310px -84px;
}
```

### Dark Mode

Dark mode is implemented by applying a `dark` class to the `<html>` or `<body>` element using (`react-toggle-dark-mode`).

```css
/* input.css */
:root[class="dark"] {
  --bodyBg: #101014;
}
```

## 13. Error Handling <a id="error-handling"></a>

This section describes the error handling strategy used in the Artha Pay platform.

### Error Boundaries (for Unhandled Errors)

We use React Router's Error Element to handle unhandled errors that occur during routing or rendering. This allows us to display a user-friendly error message or a fallback component if an unexpected error occurs, preventing the entire application from crashing.

```javascript
// src/AppRoutes.jsx (Example)
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./components/ErrorPage"; // Component to display error message
// ... other imports

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, // Your main layout component
    errorElement: <ErrorPage />, // Error boundary for this route and its children
  },
]);
```

### General Exception Handling

We use standard `try...catch` blocks throughout the application to handle exceptions. This allows us to gracefully manage potential errors and prevent them from propagating up the component tree and causing unexpected behavior.

```javascript
try {
  // Code that might throw an exception
  const result = someFunctionThatMightThrow();
  // ... process the result ...
} catch (error) {
  // Handle the error (e.g., display an error message, log the error)
  console.error("An error occurred:", error);
  // ... other error handling logic ...
}
```

### API Error Handling

We use a function called `deriveErrorMessage` to extract meaningful error messages from API responses. This function analyzes the API response status codes and other relevant information to provide a more user-friendly error message.

This function is integrated into the `httpClients` configuration. This means that any API call using our custom HTTP client will automatically have its errors processed by the `deriveErrorMessage` function.

Then, when you make the API call, you just use `try...catch` and access the error message using `error.message`.

## 14. Optimization Techniques <a id="optimization-techniques"></a>

We've employed the following optimization strategies:

- **Lazy Loading:** React's `lazy` and `Suspense` components are used to load components on demand. This significantly reduces the initial load time of the application, as only the necessary components are loaded initially. Other components are loaded only when they are needed, improving the perceived performance.

  ```javascript
  const MyComponent = React.lazy(() => import("./MyComponent"));

  function MyPage() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <MyComponent />
      </Suspense>
    );
  }
  ```

- **Memoization:** We leverage memoization techniques to prevent unnecessary re-renders of components. This is achieved through:

  - `useCallback`: Memoizes functions, ensuring that they are only recreated when their dependencies change. This is crucial for preventing unnecessary re-renders of child components that rely on these functions.

    ```javascript
    const myCallback = useCallback(() => {
      // ... some logic
    }, [dependency1, dependency2]);
    ```

  - `React.memo`: Memoizes functional components, preventing re-renders if the props haven't changed. This is a shallow comparison of props.

    ```javascript
    const MyComponent = React.memo(function MyComponent(props) {
      // ... component logic
    });
    ```

  - `useMemo`: Memoizes the result of a computation. This is useful for expensive calculations where you don't want to recompute the value unless the dependencies change.

    ```javascript
    const myValue = useMemo(() => {
      // ... expensive calculation
      return computedValue;
    }, [dependency1, dependency2]);
    ```

## 15. Security Considerations <a id="security-considerations-and-best-practices"></a>

This project prioritizes security and employs several measures to protect user data and prevent vulnerabilities.

### Authentication and Authorization

We utilize Auth0 for managing authentication and authorization. Auth0 provides a robust and secure platform for handling user logins, registration, and access control. This allows us to leverage industry best practices for authentication without having to implement and maintain our own system.

### Security Best Practices

The following security best practices are implemented throughout the application:

- **HTTPS:** All communication between the client and server is encrypted using HTTPS to protect data in transit.

- **Input Validation and Sanitization:** Robust input validation and sanitization are crucial for preventing vulnerabilities. We employ a multi-layered approach:

  - **Ant Design (Antd) Form Validation:** We leverage the built-in form validation features provided by the Ant Design library for basic UI-level validation. This helps catch common errors and provides immediate feedback to the user.

  - **Centralized Validation and Sanitization Logic:** All required regular expressions for validation, custom validation methods, and data transformation functions (e.g., removing extra spaces, trimming input, normalizing number input) are centralized in `src/core/shared/validations.js`. This promotes code reusability, maintainability, and consistency across the application.
    ```javascript
    import { Form, Input } from 'antd';

    //... within your component

    <Form.Item
    label="Username"
    name="username"
    rules={[
    { required: true, message: 'Please input your username!' },
    { whitespace: true, message: 'Username cannot contain only whitespace' }, // Example using built-in whitespace validator
    ]}

    >   <Input />
    > </Form.Item>

    {/_ ... other form items using Antd rules _/}

    ```

    ```

  - **Centralized Validation and Sanitization Logic:** All required regular expressions for validation, custom validation methods, and data transformation functions (e.g., removing extra spaces, trimming input, normalizing number input) are centralized in `src/core/shared/validations.js`. This promotes code reusability, maintainability, and consistency across the application. Here are some examples of the validation functions you might find in that file:

    ```javascript
    // Example from src/core/shared/validations.js
    export const validations = {
      requiredValidator: (required = true, message = "Is required") => {
        return {
          required: required,
          message: message,
        };
      },
      whitespaceValidator: (fieldName, whitespace = true) => {
        return {
          whitespace,
          message: `Invalid ${fieldName}`,
        };
      },
      textLengthValidator: (fieldName, minLength = 0, maxLength = 80) => {
        return () => ({
          validator(_, value) {
            const valueToValidate = value ? value.trim() : value;
            if (
              valueToValidate?.length > maxLength ||
              valueToValidate?.length < minLength
            ) {
              return Promise.reject(new Error(`Invalid ${fieldName}`));
            }
            return Promise.resolve();
          },
        });
      },
    };

    // Example usage within a form:
    <Form.Item
      rules={[validations.requiredValidator()]} // Using the centralized validator
    >
      <Input />
    </Form.Item>;
    ```

    This centralized approach ensures that validation and sanitization logic is applied consistently across all forms and data inputs. It also makes it easier to update or modify validation rules in one place.


## 16. Version Control and Branching Strategy <a id="version-control-and-branching-strategy"></a>

This project uses Git for version control and GitHub for hosting the repository.  We follow a feature branch strategy for managing code changes.

### Version Control System

We utilize Git, a distributed version control system, to track changes to the codebase.  This allows for efficient collaboration among developers, easy rollback to previous versions, and effective management of different features and releases.  The project repository is hosted on GitHub, providing a centralized platform for code sharing, issue tracking, and collaboration.

### Branching Strategy

Our branching strategy is based on feature branches.  This means that each new feature or bug fix is developed in its own dedicated branch, branched off from the main development branch (usually `develop`).  Feature branches are named with the prefix `feature/`, followed by a descriptive name of the feature.

For example:
*   `feature/user-profile`
*   `feature/membership`