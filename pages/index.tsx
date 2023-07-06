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
  items: Item[],
  totalCount: number
  rateRemaining: number,
}

const accessToken = process.env.QIITA_API_ACCESS_TOKEN

async function fetchItemsResponse(page: number, perPage: number, date: QiitaFestaDate): Promise<ItemsResponse> {
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
  // console.log(response.headers)
  return {
    items: await response.json(),
    totalCount: (response.headers.get("Total-Count") || 0) as number,
    rateRemaining: (response.headers.get('Rate-Remaining') || 0) as number,
  }
}

type Score = {
  org: string,
  count: number
}

type Result = {
  qiitaFestaDate: QiitaFestaDate,
  scores: Score[],
  totalCount: number,
  rateRemaining: number
}

async function fetchOrganizationScoreByDate(qiitaFestaDate: QiitaFestaDate): Promise<Result> {
  const scoreMap: Map<string, number> = new Map() // organization 識別子 => 記事の count
  function increment(key: string) {
    const score = scoreMap.get(key) || 0
    scoreMap.set(key, score + 1)
  }

  const perPage = 100
  let totalCount: number = 0
  let rateRemaining: number = 9999
  for (let page = 1; ; page++) {
    const itemsResponse = await fetchItemsResponse(page, perPage, qiitaFestaDate)
    if (itemsResponse.items.length === 0) {
      break
    }
    itemsResponse.items.forEach((item) => {
      if (item.organization_url_name === null) {
        return
      }
      increment(item.organization_url_name)
    })
    rateRemaining = itemsResponse.rateRemaining

    const fetchedCount = page * perPage
    totalCount = itemsResponse.totalCount
    if (fetchedCount >= totalCount) {
      break
    }
  }

  let scores: Score[] = []
  scoreMap.forEach((value, key) => {
    scores.push({ org: key, count: value })
  })
  return {
    qiitaFestaDate,
    totalCount,
    scores: scores.sort((a: Score, b: Score) => b.count - a.count),
    rateRemaining,
  }
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
  // "2023-07-11",
  // "2023-07-12",
  // "2023-07-13",
  // "2023-07-14",
  // "2023-07-15",
  // "2023-07-16",
  // "2023-07-17",
  // "2023-07-18",
  // "2023-07-19",
  // "2023-07-20",
  // "2023-07-21",
]

type TotalScore = {
  org: string, // organization 識別子
  total: number, // 記事数の合計
}

function getSortedTotalScores(results: Result[]): TotalScore[] {
  const totalScoreMap: Map<string, number> = new Map
  results.flatMap((result) => result.scores).forEach((result) => {
    const score = totalScoreMap.get(result.org) || 0
    totalScoreMap.set(result.org, score + result.count)
  })
  // ソートするために配列に直す
  const totalScores: TotalScore[] = []
  totalScoreMap.forEach((total, org) => {
    totalScores.push({ org, total })
  })
  return totalScores.sort((a, b) => b.total - a.total)
}

export default function Home({ results }: { results: Result[] }) {
  const rateRemaining = results.map((result) => result.rateRemaining || 0).reduce((a, b) => Math.min(a, b))
  const totalScores = getSortedTotalScores(results)

  return (
    <main>
      <h1>qiita-engineer-festa-2023-monitor</h1>
      <div>
        <h2>日ごとの投稿数と、上位7 Organization</h2>
        <ul>
          {results.map((result) =>
            <li key={result.qiitaFestaDate}>
              {result.qiitaFestaDate}: {result.totalCount}
              {' ('}
              {result.scores.slice(0, 7).map((score) =>
                <><a href={`https://qiita.com/organizations/${score.org}`}>{score.org}</a>: {score.count}, </>
              )}
              {')'}
            </li>
          )}
        </ul>
      </div>
      <div>
        <h2>Organization ごとの期間中の投稿数</h2>
        <p>TODO: 各 Organization のメンバー数が API で取れないので手動で数える</p>
        <ul>
          {totalScores.map(({ org, total }) =>
            <li key={org + '-' + total}><a href={`https://qiita.com/organizations/${org}`}>{org}</a>: {total}</li>
          )}
        </ul>
      </div>
      <p>Rate-Remaining: {rateRemaining}</p>
    </main >
  )
}

export async function getStaticProps() {
  const results = await Promise.all(qiitaFestaDates.map(async (qiitaFestaDate) => {
    const result = await fetchOrganizationScoreByDate(qiitaFestaDate)
    return result
  }))

  return {
    props: {
      results,
    },
    revalidate: 600, // In seconds
  };
}
