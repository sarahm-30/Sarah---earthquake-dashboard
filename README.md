Project Overview :


This single-page web app fetches and parses earthquake data from the USGS Earthquake feed. It provides users with:
- A scatter plot to visually represent magnitude and depth.
- An interactive data table showing detailed earthquake information.
- Synchronized selection between chart points and table rows.
- A statistics panel summarizing total, average, and maximum values.

Technologies Used :
- React (JavaScript) — UI framework
- Recharts — Charting library for scatter plot
- PapaParse — CSV parser
- React Context API — Shared state management
- HTML5/CSS3

Installation process:
1. Clone the repository:
git clone https://github.com/sarahm-30/Sarah---earthquake-dashboard.git

cd earthquake-dashboard
2. Install dependencies:
npm install
3. Start the development server:
npm run dev

External Dependencies : 

| Package                        | Purpose                                                              |
| ------------------------------ | -------------------------------------------------------------------- |
| `axios`                        | For data fetching functionality.                 |
| `date-fns`                     | Utility functions for manipulating and formatting dates              |
| `papaparse`                    | Efficient CSV parsing in JavaScript                                  |
| `react`                        | Core React library for building user interfaces                      |
| `react-dom`                    | React-specific DOM rendering support                                 |
| `react-virtualized-auto-sizer` | Automatically resizes components like tables to fit their containers |
| `react-window`                 | Virtualized list rendering for performance in large datasets         |
| `recharts`                     | Charting library used for rendering scatter plots and visualizations |


Features : 
- Dark-themed UI with responsive design.
- Earthquake statistics panel (total, average magnitude, depth).
- Fully synchronized selection between chart and table.
- CSV parsing via PapaParse.
- Modular code with proper React best practices.

State Management : 
- React Context is used to handle the selected earthquake and filtered data across components.
- Context is provided at the root level via EarthquakeProvider.

AI Tools Used : 
ChatGPT was used to:
- Plan component structure and state handling.
- Refactor and document CSS.

