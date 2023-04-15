import { useEffect, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { createAccount, getAccounts, sync } from "./api";

type Account = {
  id: number;
  username: string;
  password: string;
  summoner: string;
  wins: number;
  losses: number;
  lastGameAt: Date;
  lastSyncAt: Date;
  region: string;
  tier: string;
  division: string;
  matchedTier: string;
  matchedDivision: string;
  lp: number;
  riotSummonerLevel: number;
  riotProfileIconId: number;
};
import { format } from "timeago.js";

const columnHelper = createColumnHelper<Account>();

const defaultColums = [
  columnHelper.accessor("region", {
    header: () => "Region",
    size: 80,
    cell: (info) => {
      switch (info.getValue()) {
        case "la1":
          return <>LAN</>;
        case "la2":
          return <>LAS</>;
        default:
          return <></>;
      }
    },
  }),
  columnHelper.accessor("summoner", {
    header: () => "Summoner",
    cell: (info) => (
      <div className="flex items-center">
        <div className="h-10 w-10 flex-shrink-0">
          <img
            className="h-10 w-10 rounded-full"
            src={`http://ddragon.leagueoflegends.com/cdn/13.7.1/img/profileicon/${
              info.row.original.riotProfileIconId || 29
            }.png`}
            alt="profile-icon"
          />
        </div>
        <div className="ml-4 text-left">
          <div className="font-  text-gray-900">{info.getValue()}</div>
          {info.row.original.riotSummonerLevel && (
            <div className="text-gray-500 text-sm">
              Level {info.row.original.riotSummonerLevel}
            </div>
          )}
        </div>
      </div>
    ),
  }),
  columnHelper.accessor(
    (row) =>
      row.tier ? `${row.tier} ${row.division} (${row.lp} LP)` : "UNRANKED",
    {
      id: "rank",
      header: () => "Rank",
    }
  ),
  columnHelper.accessor(
    (row) => row.matchedTier && `${row.matchedTier} ${row.matchedDivision}`,
    {
      id: "matched",
      header: () => "Matched",
    }
  ),
  columnHelper.accessor((row) => row.losses + row.wins, {
    id: "total",
    header: () => "Total",
    size: 75,
  }),
  columnHelper.accessor("wins", {
    header: () => "W",
    size: 75,
  }),
  columnHelper.accessor("losses", {
    header: () => "L",
    size: 75,
  }),
  columnHelper.accessor(
    (row) => Math.round((row.wins / (row.losses + row.wins || 1)) * 100),
    {
      id: "winrate",
      header: () => "Winrate",
      cell: (info) => <>{info.getValue()}%</>,
      size: 75,
    }
  ),
  columnHelper.accessor((row) => row.lastSyncAt, {
    id: "lastSyncAt",
    header: () => "Last Sync At",
    cell: (info) => <>{info.getValue() && format(info.getValue())}</>,
  }),
  columnHelper.display({
    id: "actions",
    size: 100,
    cell: (props) => (
      <div className="flex space-x-4">
        <button
          className="text-indigo-600 hover:text-indigo-900"
          onClick={() => sync(props.row.original.id)}
        >
          Sync
        </button>
      </div>
    ),
  }),
  // columnHelper.display({
  //   id: "password",
  //   cell: () => <button>Password</button>,
  // }),
  // columnHelper.display({
  //   id: "reload",
  //   cell: () => <button>Reload</button>,
  // }),
];
function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getAccounts().then(({ data }) => {
      setData(data);
    });
  }, []);
  const table = useReactTable({
    data,
    columns: defaultColums,
    getCoreRowModel: getCoreRowModel(),
  });
  const [region, setRegion] = useState("");
  const [summoner, setSummoner] = useState("");

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Accounts
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the users in your account including their name, title,
            email and role.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => createAccount(summoner, region)}
          >
            Add account
          </button>
        </div>
        ss
        <input onChange={(e) => setRegion(e.target.value)} />
        ss
        <input onChange={(e) => setSummoner(e.target.value)} />
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header, index) => {
                        return (
                          <th
                            key={header.id}
                            colSpan={header.colSpan}
                            scope="col"
                            className="text-center text-sm font-semibold text-gray-900 py-3.5 px-3 first:pl-4 last:pr-4"
                            style={{ width: header.getSize() }}
                          >
                            {header.isPlaceholder ? null : (
                              <div
                                {...{
                                  className: header.column.getCanSort()
                                    ? "cursor-pointer select-none"
                                    : "",
                                  onClick:
                                    header.column.getToggleSortingHandler(),
                                }}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                {{
                                  asc: " 🔼",
                                  desc: " 🔽",
                                }[header.column.getIsSorted() as string] ??
                                  null}
                              </div>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {table.getRowModel().rows.map((row) => {
                    return (
                      <tr key={row.id}>
                        {row.getVisibleCells().map((cell, index) => {
                          return (
                            <td
                              key={cell.id}
                              className="text-center whitespace-nowrap px-3 py-4 first:pl-4 last:pr-4 text-sm text-gray-500"
                              style={{ width: cell.column.getSize() }}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
