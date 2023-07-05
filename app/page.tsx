import styles from './page.module.css'

type Item = {
  id: string,
  url: string,
  created_at: string,
  organization_url_name: string | null,
  user: {
    permanent_id: number,
    id: string,
    name: string,
  }
}

type ItemsResponse = {
  headers: Headers,
  items: Item[],
}

const accessToken = process.env.QIITA_API_ACCESS_TOKEN

async function getItemsResponse(page: number, perPage: number, date: QiitaFestaDate): Promise<ItemsResponse> {
  const query = new URLSearchParams({ page: `${page}`, per_page: `${perPage}`, query: `created:>=${date} created:<=${date}` })
  const response = await fetch(
    `https://qiita.com/api/v2/items?${query}`,
    {
      next: { revalidate: 300 },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  )
  return { headers: response.headers, items: await response.json() }
}

type QiitaFestaDate = "2023-06-14" | "2023-06-15" | "2023-06-16" | "2023-06-17" | "2023-06-18" | "2023-06-19" | "2023-06-20" | "2023-06-21" | "2023-06-22" | "2023-06-23" | "2023-06-24" | "2023-06-25" | "2023-06-26" | "2023-06-27" | "2023-06-28" | "2023-06-29" | "2023-06-30" | "2023-07-01" | "2023-07-02" | "2023-07-03" | "2023-07-04" | "2023-07-05" | "2023-07-06" | "2023-07-07" | "2023-07-08" | "2023-07-09" | "2023-07-10" | "2023-07-11" | "2023-07-12" | "2023-07-13" | "2023-07-14" | "2023-07-15" | "2023-07-16" | "2023-07-17" | "2023-07-18" | "2023-07-19" | "2023-07-20" | "2023-07-21"

const qiitaFestaDates: QiitaFestaDate[] = [
  "2023-06-14",
  "2023-06-15",
  "2023-06-16",
  "2023-06-17",
  "2023-06-18",
  "2023-06-19",
  "2023-06-20",
  "2023-06-21",
  "2023-06-22",
  "2023-06-23",
  "2023-06-24",
  "2023-06-25",
  "2023-06-26",
  "2023-06-27",
  "2023-06-28",
  "2023-06-29",
  "2023-06-30",
  "2023-07-01",
  "2023-07-02",
  "2023-07-03",
  "2023-07-04",
  "2023-07-05",
  "2023-07-06",
  "2023-07-07",
  "2023-07-08",
  "2023-07-09",
  "2023-07-10",
  "2023-07-11",
  "2023-07-12",
  "2023-07-13",
  "2023-07-14",
  "2023-07-15",
  "2023-07-16",
  "2023-07-17",
  "2023-07-18",
  "2023-07-19",
  "2023-07-20",
  "2023-07-21",
]

type TotalCount = {
  date: QiitaFestaDate,
  count: number | null,
  rateLimitRemaining: number | null,
}

async function getTotalCounts(): Promise<TotalCount[]> {
  return Promise.all(qiitaFestaDates.map(async (date) => {
    const itemsResponse = await getItemsResponse(1, 1, date)
    return { date, count: itemsResponse.headers.get("Total-Count"), rateLimitRemaining: itemsResponse.headers.get("Rate-Remaining") } as TotalCount
  }))
}

export default async function Home() {
  const totalCounts = await getTotalCounts()
  const rateLimitRemaining = totalCounts.map((totalCount) => totalCount.rateLimitRemaining)
    .reduce((a, b) => {
      if (a === null || b === null) {
        return 0
      }
      return Math.min(a, b)
    })
  return (
    <>
      <main className={styles.main}>
        <div className={styles.center}>
          <ul>
            {totalCounts.map((totalCount) => (
              <li key={totalCount.date}>{totalCount.date}: {totalCount.count}</li>
            ))}
          </ul>
        </div>
        <p className={styles.rateRemaining}>Rate-Remaining: {rateLimitRemaining}</p>
      </main >
    </>
  )
}
