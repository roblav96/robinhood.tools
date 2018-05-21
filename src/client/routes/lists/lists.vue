<!--  -->
<script lang="ts" src="./lists.ts"></script>

<style>
/**/

</style>

<template>
	<section>

		<section class="section">
			<div class="container">

				<b-table class="table-nowrap-first" narrowed striped hoverable :data="recents">
					<template slot-scope="props">
						<b-table-column class="has-text-left" width="1">
							<symbol-logo class="align-middle is-32x32" :symbol="props.row.symbol"></symbol-logo>
						</b-table-column>
						<b-table-column class="align-middle" label="Symbol">
							{{props.row.symbol}}
						</b-table-column>
						<b-table-column class="align-middle" field="stamp" label="Stamp">
							{{vfromnow(props.row.stamp)}}
						</b-table-column>
					</template>
				</b-table>

			</div>
		</section>

	</section>
</template>
