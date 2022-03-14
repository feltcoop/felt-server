/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`
    UPDATE spaces
    SET view = jsonb_build_object(
      'type', 'root',
      'children', jsonb_build_array(jsonb_build_object(
        'type', 'svelteComponent',
        'tagName', view ->> 'type',
        'properties', json_build_array(),
        'selfClosing', 'true'::boolean,
        'children', json_build_array()
      ))
    )
    WHERE view ->> 'type' <> 'Iframe';
  `;
	await sql`
    UPDATE spaces
    SET view = jsonb_build_object(
      'type', 'root',
      'children', jsonb_build_array(
        jsonb_build_object(
          'type', 'svelteComponent',
          'tagName', view ->> 'type',
          'properties', json_build_array(jsonb_build_object(
            'type', 'svelteProperty',
            'name', 'src',
            'value', jsonb_build_object(
              'type', 'svelteProperty',
              'name', 'src',
              'value', json_build_array(jsonb_build_object(
                'type', 'text',
                'value', view -> 'props' ->> 'url'
              ))
            )
          ))
        )
      )
    )
    WHERE view ->> 'type' = 'Iframe';
  `;
};
