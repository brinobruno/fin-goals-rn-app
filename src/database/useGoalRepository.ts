import { useSQLiteContext } from 'expo-sqlite/next'

export interface GoalCreateDatabase {
  name: string
  total: number
}

export interface GoalResponseDatabase {
  id: string
  name: string
  total: number
  current: number
}

export function useGoalRepository() {
  const database = useSQLiteContext()

  function create(goal: GoalCreateDatabase) {
    try {
      const statement = database.prepareSync(
        'INSERT INTO goals (name, total) VALUES ($name, $total)',
      )

      statement.executeSync({
        $name: goal.name,
        $total: goal.total,
      })
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  function all() {
    try {
      return database.getAllSync<GoalResponseDatabase>(`
        SELECT g.id, g.name, g.total, COALESCE(SUM(t.amount), 0) AS CURRENT
        FROM goals AS g
        LEFT JOIN transactions t ON t.goal_id = g.id
        GROUP BY g.id, g.name, g.total;
      `)
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  return {
    create,
    all,
  }
}
