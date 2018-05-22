<!--  -->
<script lang="ts" src="./symbol.summary.ts"></script>

<style>
/**/

</style>

<template>
	<section>
		<div class="container">
			<div class="columns">
				<div class="column is-12-tablet is-8-desktop is-6-widescreen is-8-desktop">
					<b-table class="" narrowed :data="tdata">
						<template slot-scope="props">
							<b-table-column label="Property" field="key" class="">
								{{props.row.key}}
							</b-table-column>
							<b-table-column label="Value" field="value" class="font-medium" :class="{'font-mono':Number.isFinite(props.row.value)}">
								{{vvalue(props.row.value)}}
							</b-table-column>
						</template>
					</b-table>
				</div>
			</div>
		</div>
	</section>
</template>
