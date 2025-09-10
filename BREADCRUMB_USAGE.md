# Breadcrumb Usage Guide

## How to Add Breadcrumbs to Any Page

Follow these simple steps to add professional breadcrumb navigation to any page in the admin panel:

### 1. Import Required Components

```jsx
// Add these imports to your page component
import Breadcrumb from '../../components/Breadcrumb';
import { Home, YourPageIcon } from '@mui/icons-material';
```

### 2. Define Breadcrumb Items

```jsx
const YourPageComponent = () => {
  // Define breadcrumb items for your page
  const breadcrumbItems = [
    { label: 'Home', path: '/clients', icon: <Home /> },
    { label: 'Your Page Name', path: null, icon: <YourPageIcon /> }
  ];

  // ... rest of your component logic
};
```

### 3. Add Breadcrumb to JSX

```jsx
return (
  <div className="your-page-class">
    <Breadcrumb items={breadcrumbItems} />
    <h2>Your Page Title</h2>
    {/* ... rest of your page content */}
  </div>
);
```

## Icon Suggestions for Different Pages

- **Projects**: `<Assignment />` or `<Work />`
- **Contacts**: `<Contacts />` or `<Person />`
- **Analytics**: `<Analytics />` or `<BarChart />`
- **Settings**: `<Settings />` or `<Tune />`
- **Logs**: `<List />` or `<History />`
- **Dashboard**: `<Dashboard />` or `<Home />`

## Examples for Common Pages

### Projects Page
```jsx
const breadcrumbItems = [
  { label: 'Home', path: '/clients', icon: <Home /> },
  { label: 'Projects', path: null, icon: <Assignment /> }
];
```

### Contacts Page
```jsx
const breadcrumbItems = [
  { label: 'Home', path: '/clients', icon: <Home /> },
  { label: 'Contacts', path: null, icon: <Contacts /> }
];
```

### Analytics Page
```jsx
const breadcrumbItems = [
  { label: 'Home', path: '/clients', icon: <Home /> },
  { label: 'Site Analytics', path: null, icon: <Analytics /> }
];
```

### Multi-level Breadcrumbs (for detail pages)
```jsx
const breadcrumbItems = [
  { label: 'Home', path: '/clients', icon: <Home /> },
  { label: 'Projects', path: '/projects', icon: <Assignment /> },
  { label: 'Project Details', path: null, icon: <Description /> }
];
```

## Notes
- Always use `path: null` for the current page (last item)
- Use appropriate Material-UI icons for each page
- Keep labels concise and descriptive
- The Home path typically points to the main dashboard/clients page
